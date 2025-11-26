import './App.css';
import {createCard, getBoard, moveCard} from "./api/taskboardAPI.js";
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

  function handleDragEnd(event) {
    const { active, over } = event;

    if (!over) { return; }

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) { return;}

    setBoard(prevBoard => {
      const columns = [...prevBoard.columns];

      const fromColumn = searchColumnIdByCardId(columns, activeId);
      const toColumn = searchColumnIdByCardId(columns, overId);

      if (!fromColumn || !toColumn) {return prevBoard;}


    })
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
