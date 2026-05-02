import { useEffect, useRef, useState } from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEdit, faTrashCan} from "@fortawesome/free-solid-svg-icons";

function CardManagement({onEdit, onDelete}) {
    const [open, setOpen] = useState(false);
    const rootRef = useRef(null);

    useEffect(() => {
        if (!open) {
            return;
        }

        function onOutsideClick(event) {
            if (!rootRef.current) {
                return;
            }
            if (!rootRef.current.contains(event.target)) {
                setOpen(false);
            }
        }

        document.addEventListener("mousedown", onOutsideClick);
        return () => { document.removeEventListener("mousedown", onOutsideClick); };
    }, [open]);

    return (
        <div ref={rootRef} className="card-management">
            <button
                className="menu-btn"
                aria-haspopup="menu"
                aria-expanded={open}
                onClick={(event) => {
                    event.stopPropagation();
                    setOpen((value) => !value);
                }}
                onPointerDown={(event) => {
                    event.stopPropagation();
                }}
            >
                ...
            </button>

            {open && (
                <div
                    className="menu-popup"
                    role="menu"
                    onClick={(event) => {event.stopPropagation();}}
                >
                    <button
                        className="menu-item"
                        role="menuitem"
                        onPointerDown={(event) => {
                            event.stopPropagation();
                        }}
                        onClick={() => {
                            setOpen(false);
                            onEdit();
                        }}
                    >
                        Edit Card
                        <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button
                        className="menu-item-del"
                        role="menuitem"
                        onPointerDown={(event) => {
                            event.stopPropagation();
                        }}
                        onClick={() => {
                            setOpen(false);
                            onDelete();
                        }}
                    >
                        Delete Card
                        <FontAwesomeIcon icon={faTrashCan} />
                    </button>
                </div>
            )}
        </div>
    );
}

export default CardManagement;
