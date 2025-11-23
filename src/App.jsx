import './App.css';
import { getBoard, getCards,
  editCard, deleteCard, createCard } from "./api/taskboardAPI.js";
import ColumnList from "./components/columnList";
import {useEffect, useState} from "react";

function App() {
  const [board, setBoard] = useState(null);
  const [columns, setColumns] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await getBoard();
      setBoard(res);
      setColumns(res.columns);
    }
    fetchData();
  }, []);

  if (!board || !board.columns) {
    return <p>Loading..</p>;
  }

  return (
    <div className="app-root">
      <ColumnList columnData={columns} />
      <button onClick={createCard}>Create default card</button>
    </div>
  )
}

export default App
