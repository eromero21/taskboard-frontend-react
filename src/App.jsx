import './App.css';
import {createCard, moveCard, editCard, deleteCard, getBoardById, getBoards} from "./api/taskboardAPI.js";
import ColumnList from "./components/columnList";
import {useEffect, useState} from "react";
import {DndContext, DragOverlay} from "@dnd-kit/core";
import Card from "./components/Card.jsx";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlus} from "@fortawesome/free-solid-svg-icons";
import CardModal from "./components/CardModal.jsx";

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
  const [activeBoardId, setActiveBoardId] = useState(null);
  const [activeBoard, setActiveBoard] = useState(null);
  const [boardList, setBoardList] = useState([]);
  const [activeCard, setActiveCard] = useState(null);
  const [showCreateCard, setShowCreateCard] = useState(false);
  const [editingCard, setEditingCard] = useState(null);

  // Initial load: Fetching board list
  useEffect(() => {
    (async () => {
      const boardsSummary = await getBoards();
      setBoardList(boardsSummary);
      console.log(boardsSummary);

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
    })().catch(console.error);
  }, []);

  // If active board changes, grab the board accordingly.
  useEffect(() => {
    if (activeBoardId == null) {
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
    })().catch(console.error);
  }, [activeBoardId]);

  if (!activeBoard || !activeBoard.columns) {
    return <p>Loading..</p>;
  }

  function handleShowCreateCard() {
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

  async function handleCreateCard(cardData) {
    const newCard = await createCard(activeBoardId, cardData);

    setActiveBoard(prevBoard => ({
      ...prevBoard,
      columns: prevBoard.columns.map(column =>
          column.type === newCard.columnId ? { ...column, cards: [...column.cards, newCard] } : column,
      )
    }));

    setShowCreateCard(false);
  }

  async function handleEditCard(cardData) {
    if (!editingCard) {
      return;
    }

    const editedCard = await editCard(activeBoardId, cardData.id, cardData);

    setActiveBoard(prevBoard => ({
      ...prevBoard,
      columns: prevBoard.columns.map(column => ({
        ...column,
        cards: column.cards.map((card) =>
          card.id === editedCard.id ? editedCard : card
        ),
      }))
    }));

    setEditingCard(null);
  }

  async function handleDeleteCard(cardId) {
    if (!cardId) {
      return;
    }
    console.log("Card deleted: ", cardId);
    await deleteCard(activeBoardId, cardId);

    setActiveBoard(prevBoard => ({
      ...prevBoard,
      columns: prevBoard.columns.map(column => ({
        ...column,
        cards: column.cards.filter((card) => card.id !== cardId),
      }))
    }));
  }

  function searchColumnIdByCardId(columns, cardId) {
    return columns.find((column) =>
        column.cards.some((card) => card.id === cardId));
  }

  function handleDragStart(event) {
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
      console.error(err);
      const resetBoard = await getBoardById(activeBoardId);
      setActiveBoard(normalizeColumns(resetBoard));
    }
  }

  function cardMoveLogic(board, activeId, overId) {
    const columns = [...board.columns];

    const fromColumn = searchColumnIdByCardId(columns, activeId);
    const toColumn = searchColumnIdByCardId(columns, overId) ||
        columns.find((column) => column.type === overId);
    let currCard = fromColumn.cards.find((card) => card.id === activeId);

    if (!fromColumn || !toColumn) {
      setActiveCard(null);
      return {board, data: null};
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

  return (
      <DndContext onDragEnd={handleDragEnd} onDragCancel={handleDragCancel} onDragStart={handleDragStart}>
        <div className="app-root">

          <button >
            <span className="button-plus-sign">
                <FontAwesomeIcon icon={faPlus} />
              </span>
            Create New Board
          </button>

          <button onClick={handleShowCreateCard}>
            <span className="button-plus-sign">
                <FontAwesomeIcon icon={faPlus} />
              </span>
            Create New Card
          </button>

          <div className="nav-bar">
            <select value={activeBoardId ?? ""}
                    onChange={(e) => setActiveBoardId(Number(e.target.value))}>
              {boardList.map((board) => (
                  <option key={board.id} value={board.id}>
                    {board.name}
                  </option>
              ))}
            </select>
          </div>

          <CardModal display={showCreateCard} onClose={handleCloseCreateCard}
                     onSubmit={handleCreateCard} />

          <CardModal display={editingCard !== null} onClose={handleDoneEditCard}
          onSubmit={handleEditCard} initialCard={editingCard} />

          <ColumnList className="columns" columnsData={activeBoard.columns}
                      onEdit={handleStartEditCard} onDelete={handleDeleteCard} />
        </div>

        <DragOverlay>
          {activeCard ? <Card cardInfo={activeCard} /> : null}
        </DragOverlay>
      </DndContext>
  )
}

export default App
