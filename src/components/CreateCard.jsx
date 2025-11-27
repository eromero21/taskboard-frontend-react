import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faX} from "@fortawesome/free-solid-svg-icons";
import {useState} from "react";

function CreateCard({display, onClose, onCreateCard}) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    if (!display) {
        return null;
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (!title.trim()) {
            return;
        }

        await onCreateCard({
            title,
            description
        });

        setTitle("");
        setDescription("");
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
                    <label>Enter card title: <span className="req-field">*</span><br/>
                        <input type="text" name="title"
                               className="create-card-title" placeholder="My Important Task"
                        onChange={(e) => setTitle(e.target.value)}/><br/>
                    </label>
                    <label>Enter card description:<br/>
                        <textarea name="description" className="create-card-description"
                               placeholder="This task is very important" rows={4}
                        onChange={(e) => setDescription(e.target.value)}/><br/>
                    </label>
                    <p><span className="req-field">* - Required Field</span></p>
                </form>
                <div className="create-card-footer">
                    <button className="create-card-submit" onClick={handleSubmit}>Submit</button>
                </div>
            </div>
        </div>
    );
}

export default CreateCard;