import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import CardManagement from "./CardManagement.jsx";

function CardShell({cardInfo, onOpen, onEdit, onDelete, isDragging, isDragOverlay = false}) {
    const canOpenDetails = Boolean(onOpen) && !isDragOverlay;
    const canManageCard = Boolean(onEdit) && Boolean(onDelete) && !isDragOverlay;

    function handleOpenDetails(event) {
        event.stopPropagation();
        if (!canOpenDetails || isDragging) {
            return;
        }
        onOpen(cardInfo);
    }

    return (
      <div className={`card${isDragOverlay ? " card-overlay" : ""}`}>
          <div className="card-header">
            {canOpenDetails ? (
                <button
                    type="button"
                    className="card-title-button"
                    onPointerDown={(event) => {
                        event.stopPropagation();
                    }}
                    onClick={handleOpenDetails}
                >
                    <h2>{cardInfo.title}</h2>
                </button>
            ) : (
                <h2 className="card-title-text">{cardInfo.title}</h2>
            )}
          </div>
          {canManageCard && (
              <CardManagement onEdit={() => onEdit(cardInfo)} onDelete={() => onDelete(cardInfo.id)} />
          )}
          <p className="card-description">{cardInfo.description}</p>
      </div>
    );
}

function Card({cardInfo, onOpen, onEdit, onDelete, isDragOverlay = false}) {
    const id = cardInfo.id;
    const {attributes, listeners, setNodeRef,
        transform, transition, isDragging} = useSortable({id});

    if (isDragOverlay) {
        return (
            <CardShell
                cardInfo={cardInfo}
                isDragging={isDragging}
                isDragOverlay
            />
        );
    }

    const style = {
        transition: isDragging ? undefined : transition,
        transform: CSS.Transform.toString(transform),
        opacity: isDragging ? 0.8 : 1,
    };

    return (
        <div className="card-sortable" ref={setNodeRef} {...attributes} {...listeners} style={style}>
            <CardShell
                cardInfo={cardInfo}
                onOpen={onOpen}
                onEdit={onEdit}
                onDelete={onDelete}
                isDragging={isDragging}
            />
        </div>
    );
}

export default Card;
