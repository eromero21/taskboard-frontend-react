import './App.css';
import {createCard, getBoard, moveCard, editCard} from "./api/taskboardAPI.js";
import ColumnList from "./components/columnList";
import {useEffect, useState} from "react";
import {DndContext, DragOverlay} from "@dnd-kit/core";
import Card from "./components/Card.jsx";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlus} from "@fortawesome/free-solid-svg-icons";
import CardModal from "./components/CardModal.jsx";

function App() {
  const [board, setBoard] = useState(null);
  const [activeCard, setActiveCard] = useState(null);
  const [showCreateCard, setShowCreateCard] = useState(false);
  const [editingCard, setEditingCard] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await getBoard();
      setBoard(res);
    }
    fetchData();
  }, []);

  if (!board || !board.columns) {
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
    const newCard = await createCard(cardData);

    setBoard(prevBoard => ({
      ...prevBoard,
      columns: prevBoard.columns.map(column =>
          column.id === newCard.columnId ? { ...column, cards: [...column.cards, newCard] } : column,
      )
    }));

    setShowCreateCard(false);
  }

  async function handleEditCard(cardData) {
    if (!editingCard) {
      return;
    }

    const editedCard = await editCard(cardData.id, cardData);

    setBoard(prevBoard => ({
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

  function searchColumnIdByCardId(columns, cardId) {
    return columns.find((column) =>
        column.cards.some((card) => card.id === cardId));
  }

  function handleDragStart(event) {
    const {active} = event;
    const activeId = active.id;

    const columns = board.columns;
    const fromColumn = searchColumnIdByCardId(columns, activeId);
    if (!fromColumn) {return;}

    const card = fromColumn.cards.find((card) => card.id === activeId);
    setActiveCard(card);
  }

  function handleDragCancel() {
    setActiveCard(null);
  }

  async function handleDragEnd(event) {
    const { active, over } = event;
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

    const {board: newBoard, data: data} = cardMoveLogic(board, activeId, overId);
    if (!data) {
      return;
    }

    setBoard(newBoard);

    try {
      await moveCard(data.card.id, data.card);
    } catch (err) {
      console.error(err);
      const resetBoard = await getBoard();
      setBoard(resetBoard);
    }
  }

  function cardMoveLogic(board, activeId, overId) {
    const columns = [...board.columns];

    const fromColumn = searchColumnIdByCardId(columns, activeId);
    const toColumn = searchColumnIdByCardId(columns, overId) ||
        columns.find((column) => column.id === overId);
    let currCard = fromColumn.cards.find((card) => card.id === activeId);

    if (!fromColumn || !toColumn) {
      setActiveCard(null);
      return {board, data: null};
    }

    const fromColIdx = columns.findIndex(column => column.id === fromColumn.id);
    const toColIdx = columns.findIndex(column => column.id === toColumn.id);

    const fromCards = [...fromColumn.cards];
    const toCards = fromColumn.id === toColumn.id ? fromCards : [...toColumn.cards];

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
    currCard.columnId = toColumn.id;
    return {
      board: {board, columns: newColumns},
      data: {
        card: currCard,
      }
    };
  }

  return (
      <DndContext onDragEnd={handleDragEnd} onDragCancel={handleDragCancel} onDragStart={handleDragStart}>
        <div className="app-root">

          <button onClick={handleShowCreateCard}>Create New Card
            <span className="button-plus-sign">
              <FontAwesomeIcon icon={faPlus} />
            </span>
          </button>
          <CardModal display={showCreateCard} onClose={handleCloseCreateCard}
                     onSubmit={handleCreateCard} />

          <CardModal display={editingCard !== null} onClose={handleDoneEditCard}
          onSubmit={handleEditCard} initialCard={editingCard} />

          <ColumnList className="columns" columnsData={board.columns} onEdit={handleStartEditCard} />
        </div>

        <DragOverlay>
          {activeCard ? <Card cardInfo={activeCard} /> : null}
        </DragOverlay>
      </DndContext>
  )
}

export default App
