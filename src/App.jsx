import './App.css';
import {
  createCard,
  generateTaskSuggestions,
  moveCard,
  editCard,
  deleteCard,
  getBoardById,
} from "./api/taskboardAPI.js";
import ColumnList from "./components/ColumnList.jsx";
import {useState} from "react";
import {DndContext, DragOverlay, PointerSensor, useSensor, useSensors} from "@dnd-kit/core";
import Card from "./components/Card.jsx";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlus, faTrashCan} from "@fortawesome/free-solid-svg-icons";
import CardModal from "./components/CardModal.jsx";
import BoardModal from "./components/BoardModal.jsx";
import LoginPage from "./components/LoginPage.jsx";
import CardDetailModal from "./components/CardDetailModal.jsx";
import AiGenerateModal from "./components/AiGenerateModal.jsx";
import {useAuth} from "./hooks/useAuth.js"
import {useBoard} from "./hooks/useBoard.js"

function App() {
  const [showCreateBoard, setShowCreateBoard] = useState(false);
  const [showAiGenerate, setShowAiGenerate] = useState(false);

  const [draggedCard, setDraggedCard] = useState(null);
  const [showCreateCard, setShowCreateCard] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [detailModalStartInEdit, setDetailModalStartInEdit] = useState(false);

  const sensors = useSensors(
      useSensor(PointerSensor, {
        activationConstraint: {
          distance: 8,
        },
      }),
  );

  const {
    authToken,
    authNotice,
      handleUnauthorizedSession,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
  } = useAuth();

  const {
    hasBoards,
    activeBoardId,
    activeBoard,
    boardList,
    isBoardReady,
    isBootstrappingWorkspace,
    canCreateCards,
    setActiveBoard,
    resetBoardState,
    handleActiveBoardChange,
    handleCreateBoard,
    handleDeleteBoard,
    normalizeColumns,
    appendCardsToBoard,
  } = useBoard({
    authToken, handleUnauthorizedSession
  })

  if (!authToken) {
    return <LoginPage onLogin={handleLogin} onRegister={handleRegister} notice={authNotice} />;
  }

  function resetAppState() {
    setShowCreateBoard(false);
    setShowAiGenerate(false);
    setShowCreateCard(false);
    setSelectedCardId(null);
    setDetailModalStartInEdit(false);
    setDraggedCard(null);
  }

  function handleAppLogout() {
    handleLogout();
    resetAppState();
    resetBoardState();
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

  function handleShowAiGenerate() {
    if (!activeBoard?.columns || activeBoardId == null) {
      return;
    }

    setShowAiGenerate(true);
  }

  function handleCloseCreateCard() {
    setShowCreateCard(false);
  }

  function handleCloseAiGenerate() {
    setShowAiGenerate(false);
  }

  function handleOpenCardDetail(card) {
    setSelectedCardId(card.id);
    setDetailModalStartInEdit(false);
  }

  function handleStartEditCard(card) {
    setSelectedCardId(card.id);
    setDetailModalStartInEdit(true);
  }

  function handleCloseCardDetail() {
    setSelectedCardId(null);
    setDetailModalStartInEdit(false);
  }

  async function handleCreateBoardandClose(boardData) {
    await handleCreateBoard(boardData);
    setShowCreateBoard(false);
  }

  async function handleDeleteBoardandReset() {
    const confirmDelete = await handleDeleteBoard();

    if (confirmDelete) {
      resetAppState();
    }
  }

  async function handleCreateCard(cardData) {
    if (!activeBoard?.columns || activeBoardId == null) {
      return;
    }

    try {
      const newCard = await createCard(activeBoardId, cardData);

      setActiveBoard((prevBoard) => appendCardsToBoard(prevBoard, [newCard]));

      setShowCreateCard(false);
    } catch (error) {
      if (!handleUnauthorizedSession(error)) {
        console.error(error);
      }
    }
  }

  async function handleGenerateAiTasks(projectIdea) {
    try {
      return await generateTaskSuggestions(projectIdea);
    } catch (error) {
      if (handleUnauthorizedSession(error, {includeForbidden: false})) {
        throw new Error("Your session expired. Please log in again.");
      }

      throw error;
    }
  }

  async function handleApplyGeneratedTasks(tasks) {
    if (!activeBoard?.columns || activeBoardId == null || tasks.length === 0) {
      return false;
    }

    const createdCards = [];

    try {
      for (const task of tasks) {
        const createdCard = await createCard(activeBoardId, task);
        createdCards.push(createdCard);
      }

      setActiveBoard((prevBoard) => appendCardsToBoard(prevBoard, createdCards));
      setShowAiGenerate(false);
      return true;
    } catch (error) {
      if (handleUnauthorizedSession(error)) {
        return false;
      }

      console.error(error);

      try {
        const refreshedBoard = await getBoardById(activeBoardId);
        setActiveBoard(normalizeColumns(refreshedBoard));
      } catch (refreshError) {
        if (!handleUnauthorizedSession(refreshError)) {
          console.error(refreshError);
        }
      }

      throw error;
    }
  }

  async function handleEditCard(cardData) {
    if (!selectedCardId) {
      return false;
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
      return true;
    } catch (error) {
      if (!handleUnauthorizedSession(error)) {
        console.error(error);
      }
      return false;
    }
  }

  async function handleDeleteCard(cardId) {
    if (!cardId) {
      return false;
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

      if (selectedCardId === cardId) {
        handleCloseCardDetail();
      }
      return true;
    } catch (error) {
      if (!handleUnauthorizedSession(error)) {
        console.error(error);
      }
      return false;
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
    setDraggedCard(card);
  }

  function handleDragCancel() {
    setDraggedCard(null);
  }

  async function handleDragEnd(event) {
    if (!activeBoard?.columns) {
      setDraggedCard(null);
      return;
    }

    const {active, over} = event;
    if (!over) {
      setDraggedCard(null);
      return;
    }

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) {
      setDraggedCard(null);
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
      setDraggedCard(null);
      return {board, card: null};
    }

    const columns = [...board.columns];

    const fromColumn = searchColumnIdByCardId(columns, activeId);
    const toColumn = searchColumnIdByCardId(columns, overId) ||
        columns.find((column) => column.type === overId);

    if (!fromColumn || !toColumn) {
      setDraggedCard(null);
      return {board, card: null};
    }

    const currCard = fromColumn.cards.find((card) => card.id === activeId);
    if (!currCard) {
      setDraggedCard(null);
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

    setDraggedCard(null);
    const updatedCard = {...currCard, columnId: toColumn.type};
    return {
      board: {...board, columns: newColumns},
      card: updatedCard,
    };
  }

  const selectedCardDetails = activeBoard?.columns
      ?.flatMap((column) =>
          column.cards.map((card) => ({
            ...card,
            columnName: column.name,
            columnType: column.type,
          })),
      )
      .find((card) => card.id === selectedCardId) ?? null;

  return (
      <DndContext
          sensors={sensors}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
          onDragStart={handleDragStart}
      >
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

              <button onClick={handleShowAiGenerate} disabled={!canCreateCards}>
                Ai Generate
              </button>
            </div>

            <div className="nav-bar-center">
              <div className="board-selection-root">
                <select value={activeBoardId ?? ""} className="board-selector"
                        disabled={!hasBoards}
                        onChange={(e) => handleActiveBoardChange(Number(e.target.value))}>
                  {!hasBoards && <option value="">No boards yet</option>}
                  {boardList.map((board) => (
                      <option key={board.id} value={board.id}>
                        {board.name}
                      </option>
                  ))}
                </select>
                <button
                    className="delete-board-button"
                    type="button"
                    disabled={!hasBoards}
                    onClick={handleDeleteBoardandReset}
                >
                  <FontAwesomeIcon icon={faTrashCan} />
                  Delete Board
                </button>
              </div>
            </div>

            <div className="nav-bar-right">
              <button onClick={handleAppLogout}>Log Out</button>
            </div>
          </div>

          <BoardModal display={showCreateBoard} onClose={handleCloseCreateBoard}
                      onSubmit={handleCreateBoardandClose} />

          <CardModal display={showCreateCard} onClose={handleCloseCreateCard}
                     onSubmit={handleCreateCard} />

          <AiGenerateModal
              display={showAiGenerate}
              onClose={handleCloseAiGenerate}
              onGenerate={handleGenerateAiTasks}
              onApply={handleApplyGeneratedTasks}
          />

          {selectedCardDetails !== null && (
              <CardDetailModal
                  key={`${selectedCardDetails.id}-${detailModalStartInEdit ? "edit" : "view"}`}
                  display={selectedCardDetails !== null}
                  card={selectedCardDetails}
                  startInEdit={detailModalStartInEdit}
                  onClose={handleCloseCardDetail}
                  onSave={handleEditCard}
                  onDelete={handleDeleteCard}
              />
          )}

          {isBootstrappingWorkspace && (
              <p className="app-status-message">Loading your workspace...</p>
          )}

          {!isBootstrappingWorkspace && !hasBoards && (
              <div className="empty-state">
                <h2>Your workspace is ready.</h2>
                <p>Create your first board to start organizing tasks.</p>
              </div>
          )}

          {!isBootstrappingWorkspace && hasBoards && isBoardReady && (
              <ColumnList className="columns" columnsData={activeBoard.columns}
                          onOpenDetails={handleOpenCardDetail}
                          onEdit={handleStartEditCard}
                          onDelete={handleDeleteCard} />
          )}
        </div>

        <DragOverlay>
          {draggedCard ? <Card cardInfo={draggedCard} /> : null}
        </DragOverlay>
      </DndContext>
  )
}

export default App
