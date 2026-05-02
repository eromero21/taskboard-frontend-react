import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrashCan, faX } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useRef, useState } from "react";

function formatCreatedDate(card) {
    const rawDate =
        card?.createdAt ??
        card?.createdDate ??
        card?.createdOn ??
        card?.created_at ??
        card?.created_on ??
        null;

    if (!rawDate) {
        return "Unavailable";
    }

    const parsedDate = new Date(rawDate);
    if (Number.isNaN(parsedDate.getTime())) {
        return String(rawDate);
    }

    return new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(parsedDate);
}

function formatStatus(card) {
    if (card?.columnName) {
        return card.columnName;
    }

    if (!card?.columnType) {
        return "Unavailable";
    }

    return card.columnType
        .toLowerCase()
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

function CardDetailModal({
    display,
    card,
    startInEdit = false,
    onClose,
    onSave,
    onDelete,
}) {
    const modalRef = useRef(null);
    const [isEditing, setIsEditing] = useState(startInEdit);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    useEffect(() => {
        if (!display || !card) {
            return;
        }

        modalRef.current?.focus();
        setIsEditing(startInEdit);
        setTitle(card.title ?? "");
        setDescription(card.description ?? "");
    }, [card, display, startInEdit]);

    if (!display || !card) {
        return null;
    }

    function resetForm() {
        setTitle(card.title ?? "");
        setDescription(card.description ?? "");
    }

    async function handleSubmit(event) {
        event.preventDefault();

        const finalTitle = title.trim();
        if (!finalTitle) {
            return;
        }

        const didSave = await onSave({
            id: card.id,
            title: finalTitle,
            description: description.trim() || "No description given.",
        });

        if (didSave !== false) {
            setIsEditing(false);
        }
    }

    function handleCancelEdit() {
        resetForm();
        setIsEditing(false);
    }

    async function handleDelete() {
        const didDelete = await onDelete(card.id);
        if (didDelete !== false) {
            onClose();
        }
    }

    function handleKeyDown(event) {
        if (event.key !== "Escape") {
            return;
        }

        event.preventDefault();

        if (isEditing) {
            handleCancelEdit();
            return;
        }

        onClose();
    }

    return (
        <div className="create-card-backdrop" onClick={onClose}>
            <div
                className="create-card detail-card-modal"
                ref={modalRef}
                tabIndex={-1}
                onClick={(event) => event.stopPropagation()}
                onKeyDown={handleKeyDown}
            >
                <h1 className="create-card-header">
                    {isEditing ? "Edit Card" : "Card Details"}
                </h1>
                <button className="create-card-close" onClick={onClose} type="button">
                    <FontAwesomeIcon icon={faX} />
                </button>

                <form className="create-card-fields detail-card-fields" onSubmit={handleSubmit}>
                    <div className="detail-card-metadata">
                        <div className="detail-card-meta-item">
                            <span className="detail-card-meta-label">Status</span>
                            <span>{formatStatus(card)}</span>
                        </div>
                        <div className="detail-card-meta-item">
                            <span className="detail-card-meta-label">Created</span>
                            <span>{formatCreatedDate(card)}</span>
                        </div>
                    </div>

                    <label>
                        Title
                        {isEditing ? (
                            <input
                                type="text"
                                name="title"
                                className="create-card-title"
                                value={title}
                                onChange={(event) => setTitle(event.target.value)}
                                maxLength={50}
                            />
                        ) : (
                            <div className="detail-card-readonly">{card.title}</div>
                        )}
                    </label>

                    <label>
                        Description
                        {isEditing ? (
                            <textarea
                                name="description"
                                className="create-card-description"
                                value={description}
                                rows={6}
                                maxLength={500}
                                onChange={(event) => setDescription(event.target.value)}
                            />
                        ) : (
                            <div className="detail-card-readonly detail-card-description-text">
                                {card.description || "No description given."}
                            </div>
                        )}
                    </label>

                    <div className="create-card-footer detail-card-footer">
                        {isEditing ? (
                            <>
                                <button className="create-card-submit" type="submit">
                                    Save
                                </button>
                                <button type="button" onClick={handleCancelEdit}>
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <>
                                <button type="button" onClick={() => setIsEditing(true)}>
                                    Edit
                                    <FontAwesomeIcon icon={faEdit} />
                                </button>
                                <button type="button" className="detail-card-delete" onClick={handleDelete}>
                                    Delete
                                    <FontAwesomeIcon icon={faTrashCan} />
                                </button>
                                <button type="button" onClick={onClose}>
                                    Close
                                </button>
                            </>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CardDetailModal;
