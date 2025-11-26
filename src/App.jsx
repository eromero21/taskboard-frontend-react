import './App.css';
import {createCard, getBoard, moveCard} from "./api/taskboardAPI.js";
import ColumnList from "./components/columnList";
import {useEffect, useState} from "react";
import {DndContext, DragOverlay} from "@dnd-kit/core";
import Card from "./components/Card.jsx";

function App() {
  const [board, setBoard] = useState(null);
  const [activeCard, setActiveCard] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await getBoard();
      setBoard(res);
      console.log(res);
    }
    fetchData();
  }, []);

  if (!board || !board.columns) {
    return <p>Loading..</p>;
  }

  async function handleCreateCard() {
    let cardData = {};
    cardData.title = "DJ Spitz";
    cardData.description = "I'ma soundcloud rapper man.";

    const newCard = await createCard(cardData);
    setBoard(prevBoard => ({
      ...prevBoard,
      columns: prevBoard.columns.map(column =>
        column.id === newCard.columnId ? { ...column, cards: [...column.cards, newCard] } : column,
      )
    }));
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
    console.log("ActiveID: ", active.id, "OverID: ", over.id);

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
      console.log(data.card.id);
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
          <button onClick={handleCreateCard}>Create default card</button>
          <ColumnList className="columns" columnsData={board.columns} />
        </div>

        <DragOverlay>
          {activeCard ? <Card cardInfo={activeCard} /> : null}
        </DragOverlay>
      </DndContext>
  )
}

export default App
