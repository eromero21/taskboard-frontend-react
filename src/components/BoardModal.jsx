import {useEffect, useRef, useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faX} from "@fortawesome/free-solid-svg-icons";

function BoardModal({display, onClose, onSubmit}) {
    const [name, setName] = useState('');

    const modalRef = useRef(null);

    useEffect(() => {
        if (!display) {
            return;
        }

        modalRef.current?.focus();
    });

    if (!display) {
        return null;
    }

    async function handleSubmit(event) {
        event.preventDefault();

        const finalName = name.trim();
        if (!finalName) {
            return;
        }

        await onSubmit(finalName);

        setName("");
    }

    function handleKeyDown(event) {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            handleSubmit(event);
        }
        if (event.key === "Escape") {
            event.preventDefault();
            onClose();
        }
    }

    return (
        <div className="create-board-backdrop" onClick={onClose}>
            <div className="create-board" ref={modalRef}
                 onClick={(e) => e.stopPropagation()}>
                <h1 className="create-board-header">Create Board</h1>
                <button className="create-board-close" onClick={onClose}>
                    <FontAwesomeIcon icon={faX} />
                </button>
                <form className="create-board-fields" onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
                    <label>Enter board title: <span className="req-field">*</span><br/>
                        <input type="text" name="title"
                               className="create-board-title" placeholder="A Super Cool Board" value={name}
                               onChange={(e) =>
                                   setName(e.target.value)} maxLength={50}/><br/>
                    </label>
                    <p><span className="req-field">* - Required Field</span></p>
                    <div className="create-board-footer">
                        <button className="create-board-submit" type="submit">Submit</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default BoardModal;