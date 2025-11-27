import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faX} from "@fortawesome/free-solid-svg-icons";
import {useState} from "react";
import {createCard} from "../api/taskboardAPI.js";

function CreateCard({display, onClose}) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    if (!display) {
        return null;
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

    return (
        <div className="create-card-backdrop" onClick={onClose}>
            <div className="create-card"
                 onClick={(e) => e.stopPropagation()}>
                <h1 className="create-card-header">Create Card</h1>
                <button className="create-card-close" onClick={onClose}>
                    <FontAwesomeIcon icon={faX} />
                </button>
                <form className="create-card-fields">
                    <label>Enter card title: *<br/>
                        <input type="text" name="title"
                               className="create-card-title" placeholder="My Important Task"
                        onChange={(e) => setTitle(e.target.value)}/><br/>
                    </label>
                    <label>Enter card description:<br/>
                        <textarea name="description" className="create-card-description"
                               placeholder="This task is very important" rows={4}
                        onChange={(e) => setDescription(e.target.value)}/><br/>
                    </label>
                    <p>* <span className="req-field">- Required Field</span></p>
                </form>
                <button className="create-card-submit" onClick={handleCreateCard}>Submit</button>
            </div>
        </div>
    );
}

export default CreateCard;