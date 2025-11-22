import './App.css';
import { getBoard, getCards,
  editCard, deleteCard, createCard } from "./api/taskboardAPI.js";
import {useEffect, useState} from "react";

function App() {
  const [board, setBoard] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await getBoard();
      console.log(res);
    }
    fetchData();
  }, []);

  return (
    <>
      My app
    </>
  )
}

export default App
