import './App.css';
import {
  createCard,
  login,
  moveCard,
  editCard,
  deleteCard,
  getBoardById,
  getBoards,
  createBoard,
  register
} from "./api/taskboardAPI.js";
import {clearAuthToken, getAuthToken} from "./api/fetcherAuth.js";
import ColumnList from "./components/ColumnList.jsx";
import {useEffect, useState} from "react";
import {DndContext, DragOverlay} from "@dnd-kit/core";
import Card from "./components/Card.jsx";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlus} from "@fortawesome/free-solid-svg-icons";
import CardModal from "./components/CardModal.jsx";
import BoardModal from "./components/BoardModal.jsx";
import LoginPage from "./components/LoginPage.jsx";

const columnsOrder = ["BACKLOG", "TODO", "IN_PROGRESS", "COMPLETED"];

function normalizeColumns(board) {
  if (Array.isArray(board.columns)) {
    const normColumns = [...board.columns].sort(
        (a, b) => columnsOrder.indexOf(a.type) - columnsOrder.indexOf(b.type));
    return { ...board, columns: normColumns };
  }

  return board;
}

function App() {
  const [authToken, setAuthToken] = useState(() => getAuthToken());
  const [authNotice, setAuthNotice] = useState("");
  const [isLoadingBoards, setIsLoadingBoards] = useState(false);
  const [activeBoardId, setActiveBoardId] = useState(null);
  const [activeBoard, setActiveBoard] = useState(null);
  const [boardList, setBoardList] = useState([]);
  const [showCreateBoard, setShowCreateBoard] = useState(false);

  const [activeCard, setActiveCard] = useState(null);
  const [showCreateCard, setShowCreateCard] = useState(false);
  const [editingCard, setEditingCard] = useState(null);

  function isUnauthorizedError(error) {
    return error instanceof Error && error.message.startsWith("401");
  }

  function resetBoardState() {
    setActiveBoardId(null);
    setActiveBoard(null);
    setBoardList([]);
    setShowCreateBoard(false);
    setShowCreateCard(false);
    setEditingCard(null);
    setActiveCard(null);
  }

  function handleUnauthorizedSession(error) {
    if (!isUnauthorizedError(error)) {
      return false;
    }

    clearAuthToken();
    setAuthToken(null);
    setAuthNotice("Your session expired. Please log in again.");
    resetBoardState();
    return true;
  }

  async function handleLogin(credentials) {
    await login(credentials);
    setAuthToken(getAuthToken());
    setAuthNotice("");
  }

  async function handleRegister(credentials) {
    await register(credentials);
    setAuthToken(getAuthToken());
    setAuthNotice("");
  }

  function handleLogout() {
    clearAuthToken();
    setAuthToken(null);
    setAuthNotice("");
    resetBoardState();
  }

  // Initial load: Fetching board list
  useEffect(() => {
    if (!authToken) {
      return;
    }

    (async () => {
      setIsLoadingBoards(true);
      const boardsSummary = await getBoards();
      setBoardList(boardsSummary);

      if (!boardsSummary || boardsSummary.length === 0) {
        setActiveBoardId(null);
        setActiveBoard(null);
        return;
      }

      const prevData = localStorage.getItem("activeBoardId");
      const prevBoardId = prevData ? Number(prevData) : null;

      const initId =
          prevBoardId && boardsSummary.some((b) => b.id === prevBoardId) ? prevBoardId :
          boardsSummary[0].id;

      setActiveBoardId(initId);
    })()
        .catch((error) => {
          if (!isUnauthorizedError(error)) {
            console.error(error);
            return;
          }

          clearAuthToken();
          setAuthToken(null);
          setAuthNotice("Your session expired. Please log in again.");
          resetBoardState();
        })
        .finally(() => {
          setIsLoadingBoards(false);
        });
  }, [authToken]);

  // If active board changes, grab the board accordingly.
  useEffect(() => {
    if (!authToken || activeBoardId == null) {
      return;
    }

    const id = Number(activeBoardId);
    if (Number.isNaN(id)) {
      return;
    }

    localStorage.setItem("activeBoardId", String(id));

    (async () => {
      const board = await getBoardById(activeBoardId);
      const normBoard = normalizeColumns(board);
      setActiveBoard(normBoard);
    })().catch((error) => {
      if (!isUnauthorizedError(error)) {
        console.error(error);
        return;
      }

      clearAuthToken();
      setAuthToken(null);
      setAuthNotice("Your session expired. Please log in again.");
      resetBoardState();
    });
  }, [activeBoardId, authToken]);

  if (!authToken) {
    return <LoginPage onLogin={handleLogin} onRegister={handleRegister} notice={authNotice} />;
  }

  function handleShowCreateBoard() {
    setShowCreateBoard(true);
  }

  function handleCloseCreateBoard() {
    setShowCreateBoard(false);
  }

  function handleShowCreateCard() {
    if (!activeBoard?.columns || activeBoardId == null) {
      return;
    }

    setShowCreateCard(true);
  }

  function handleCloseCreateCard() {
    setShowCreateCard(false);
  }

  function handleStartEditCard(card) {
    setEditingCard(card);
  }

  function handleDoneEditCard() {
    setEditingCard(null);
  }

  async function handleCreateBoard(boardData) {
    try {
      const newBoard = await createBoard(boardData);

      // UseEffect will assign normalized board
      setActiveBoardId(newBoard.id);

      const freshBoards = await getBoards();
      setBoardList(freshBoards);

      setShowCreateBoard(false);
    } catch (error) {
      if (!handleUnauthorizedSession(error)) {
        console.error(error);
      }
    }
  }

  async function handleCreateCard(cardData) {
    if (!activeBoard?.columns || activeBoardId == null) {
      return;
    }

    try {
      const newCard = await createCard(activeBoardId, cardData);

      setActiveBoard(prevBoard => {
        if (!prevBoard?.columns) {
          return prevBoard;
        }

        return {
          ...prevBoard,
          columns: prevBoard.columns.map(column =>
              column.type === newCard.columnId ? { ...column, cards: [...column.cards, newCard] } : column,
          )
        };
      });

      setShowCreateCard(false);
    } catch (error) {
      if (!handleUnauthorizedSession(error)) {
        console.error(error);
      }
    }
  }

  async function handleEditCard(cardData) {
    if (!editingCard) {
      return;
    }

    try {
      const editedCard = await editCard(activeBoardId, cardData.id, cardData);

      setActiveBoard(prevBoard => {
        if (!prevBoard?.columns) {
          return prevBoard;
        }

        return {
          ...prevBoard,
          columns: prevBoard.columns.map(column => ({
            ...column,
            cards: column.cards.map((card) =>
              card.id === editedCard.id ? editedCard : card
            ),
          }))
        };
      });

      setEditingCard(null);
    } catch (error) {
      if (!handleUnauthorizedSession(error)) {
        console.error(error);
      }
    }
  }

  async function handleDeleteCard(cardId) {
    if (!cardId) {
      return;
    }

    try {
      await deleteCard(activeBoardId, cardId);

      setActiveBoard(prevBoard => {
        if (!prevBoard?.columns) {
          return prevBoard;
        }

        return {
          ...prevBoard,
          columns: prevBoard.columns.map(column => ({
            ...column,
            cards: column.cards.filter((card) => card.id !== cardId),
          }))
        };
      });
    } catch (error) {
      if (!handleUnauthorizedSession(error)) {
        console.error(error);
      }
    }
  }

  function searchColumnIdByCardId(columns, cardId) {
    return columns.find((column) =>
        column.cards.some((card) => card.id === cardId));
  }

  function handleDragStart(event) {
    if (!activeBoard?.columns) {
      return;
    }

    const {active} = event;
    const activeId = active.id;

    const columns = activeBoard.columns;
    const fromColumn = searchColumnIdByCardId(columns, activeId);
    if (!fromColumn) {return;}

    const card = fromColumn.cards.find((card) => card.id === activeId);
    setActiveCard(card);
  }

  function handleDragCancel() {
    setActiveCard(null);
  }

  async function handleDragEnd(event) {
    if (!activeBoard?.columns) {
      setActiveCard(null);
      return;
    }

    const {active, over} = event;
    if (!over) {
      setActiveCard(null);
      return;
    }

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) {
      setActiveCard(null);
      return;
    }

    const {board: newBoard, card: currCard} = cardMoveLogic(activeBoard, activeId, overId);
    if (!currCard) {
      return;
    }

    setActiveBoard(newBoard);

    try {
      await moveCard(activeBoardId, currCard.id, currCard);
    } catch (err) {
      if (handleUnauthorizedSession(err)) {
        return;
      }
      console.error(err);
      const resetBoard = await getBoardById(activeBoardId);
      setActiveBoard(normalizeColumns(resetBoard));
    }
  }

  function cardMoveLogic(board, activeId, overId) {
    if (!board?.columns) {
      setActiveCard(null);
      return {board, card: null};
    }

    const columns = [...board.columns];

    const fromColumn = searchColumnIdByCardId(columns, activeId);
    const toColumn = searchColumnIdByCardId(columns, overId) ||
        columns.find((column) => column.type === overId);

    if (!fromColumn || !toColumn) {
      setActiveCard(null);
      return {board, card: null};
    }

    const currCard = fromColumn.cards.find((card) => card.id === activeId);
    if (!currCard) {
      setActiveCard(null);
      return {board, card: null};
    }

    const fromColIdx = columns.findIndex(column => column.type === fromColumn.type);
    const toColIdx = columns.findIndex(column => column.type === toColumn.type);

    const fromCards = [...fromColumn.cards];
    const toCards = fromColumn.type === toColumn.type ? fromCards : [...toColumn.cards];

    const fromCardIdx = fromCards.findIndex(card => card.id === activeId);
    let toCardIdx = toCards.findIndex(card => card.id === overId);
    if (toCardIdx === -1) {
      toCardIdx = toCards.length;
    }

    const [move] = fromCards.splice(fromCardIdx, 1);
    toCards.splice(toCardIdx, 0, move);

    const newColumns = [...columns];
    newColumns[fromColIdx] = {...fromColumn, cards: fromCards};
    newColumns[toColIdx] = {...toColumn, cards: toCards};

    setActiveCard(null);
    const updatedCard = {...currCard, columnId: toColumn.type}
    return {
      board: {...board, columns: newColumns},
      card: updatedCard,
    };
  }

  const hasBoards = boardList.length > 0;
  const isBoardReady = Boolean(activeBoard?.columns);
  const canCreateCards = hasBoards && isBoardReady;

  return (
      <DndContext onDragEnd={handleDragEnd} onDragCancel={handleDragCancel} onDragStart={handleDragStart}>
        <div className="app-root">

          <div className="nav-bar-container">
            <div className="nav-bar-left">
              <button onClick={handleShowCreateBoard}>
                <span className="button-plus-sign">
                    <FontAwesomeIcon icon={faPlus} />
                  </span>
                Create New Board
              </button>

              <button onClick={handleShowCreateCard} disabled={!canCreateCards}>
                <span className="button-plus-sign">
                    <FontAwesomeIcon icon={faPlus} />
                  </span>
                Create New Card
              </button>
            </div>

            <div className="nav-bar-center">
              <div className="board-selection-root">
                <select value={activeBoardId ?? ""} className="board-selector"
                        disabled={!hasBoards}
                        onChange={(e) => setActiveBoardId(Number(e.target.value))}>
                  {!hasBoards && <option value="">No boards yet</option>}
                  {boardList.map((board) => (
                      <option key={board.id} value={board.id}>
                        {board.name}
                      </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="nav-bar-right">
              <button onClick={handleLogout}>Log Out</button>
            </div>
          </div>

          <BoardModal display={showCreateBoard} onClose={handleCloseCreateBoard}
                      onSubmit={handleCreateBoard} />

          <CardModal display={showCreateCard} onClose={handleCloseCreateCard}
                     onSubmit={handleCreateCard} />

          <CardModal display={editingCard !== null} onClose={handleDoneEditCard}
          onSubmit={handleEditCard} initialCard={editingCard} />

          {isLoadingBoards && <p className="app-status-message">Loading your boards...</p>}

          {!isLoadingBoards && !hasBoards && (
              <div className="empty-state">
                <h2>Your workspace is ready.</h2>
                <p>Create your first board to start organizing tasks.</p>
              </div>
          )}

          {!isLoadingBoards && hasBoards && isBoardReady && (
              <ColumnList className="columns" columnsData={activeBoard.columns}
                          onEdit={handleStartEditCard} onDelete={handleDeleteCard} />
          )}
        </div>

        <DragOverlay>
          {activeCard ? <Card cardInfo={activeCard} /> : null}
        </DragOverlay>
      </DndContext>
  )
}

export default App
