import './App.css';
import { getBoard, getCards,
  editCard, deleteCard, createCard } from "./api/taskboardAPI.js";
import ColumnList from "./components/columnList";
import {useEffect, useState} from "react";
import {DndContext} from "@dnd-kit/core";

function App() {
  const [board, setBoard] = useState(null);

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
    cardData.title = "Get outta my head";
    cardData.description = "I'm a card n shit man.";

    const newCard = await createCard(cardData);
    setBoard(prevBoard => ({
      ...prevBoard,
      columns: prevBoard.columns.map(column =>
        column.id === newCard.columnId ? { ...column, cards: [...column.cards, newCard] } : column,
      )
    }));
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    console.log("Dragged", active.id, "over", over?.id);
  }

  return (
      <DndContext onDragEnd={handleDragEnd}>
        <div className="app-root">
          <button onClick={handleCreateCard}>Create default card</button>
          <ColumnList className="columns" columnsData={board.columns} />
        </div>
      </DndContext>
  )
}

export default App
