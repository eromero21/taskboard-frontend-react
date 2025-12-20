import { useState, useEffect, useRef } from 'react';
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

        document.addEventListener('mousedown', onOutsideClick);
        return () => { document.removeEventListener('mousedown', onOutsideClick); };
    }, [open]);

    return (
        <div ref={rootRef} className="card-management">
            <button
                className="menu-btn"
                aria-haspopup="menu"
                aria-expanded={open}
                onClick={(e) => {
                    e.stopPropagation();
                    setOpen((v) => !v);
                }}
                onPointerDown={(e) => {
                    e.stopPropagation();
                }}
                >
                ⋯
            </button>

            {open && (
                <div
                    className="menu-popup"
                    role="menu"
                    onClick={(e) => {e.stopPropagation();}}
                >
                    <button
                        className="menu-item"
                        role="menuitem"
                        onPointerDown={(e) => {
                            e.stopPropagation();
                        }}
                        onClick={() => {
                            setOpen(false);
                            onEdit();
                            console.log("Edit action occurring..");
                        }}
                        >
                        Edit Card
                        <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button
                        className="menu-item-del"
                        role="menuitem"
                        onPointerDown={(e) => {
                            e.stopPropagation();
                        }}
                        onClick={() => {
                            setOpen(false);
                            onDelete();
                            console.log("Delete action occurring..");
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