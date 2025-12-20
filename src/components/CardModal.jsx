import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faX} from "@fortawesome/free-solid-svg-icons";
import {useEffect, useState} from "react";

function CardModal({display, onClose, onSubmit, initialCard = null}) {
    const isEdit = Boolean(initialCard);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    useEffect(() => {
        if (!display) {return;}

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTitle(initialCard?.title ?? "");
        setDescription(initialCard?.description ?? "");
    }, [display, initialCard]);

    if (!display) {
        return null;
    }

    async function handleSubmit(event) {
        event.preventDefault();

        const finalTitle = title.trim();
        if (!finalTitle) {
            return;
        }

        const finalDesc = description.trim() || "No description given.";
        const cardId = initialCard ? initialCard.id : null;

        await onSubmit({
            id: cardId,
            title: finalTitle,
            description: finalDesc,
        });

        setTitle("");
        setDescription("");
    }

    return (
        <div className="create-card-backdrop" onClick={onClose}>
            <div className="create-card"
                 onClick={(e) => e.stopPropagation()}>
                <h1 className="create-card-header">{isEdit ? "Edit Card" : "Create Card"}</h1>
                <button className="create-card-close" onClick={onClose}>
                    <FontAwesomeIcon icon={faX} />
                </button>
                <form className="create-card-fields">
                    <label>Enter card title: <span className="req-field">*</span><br/>
                        <input type="text" name="title"
                               className="create-card-title" placeholder="My Important Task" value={title}
                        onChange={(e) => setTitle(e.target.value)}/><br/>
                    </label>
                    <label>Enter card description:<br/>
                        <textarea name="description" className="create-card-description"
                               placeholder="This task is very important" value={description} rows={4}
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

export default CardModal;