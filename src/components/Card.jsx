import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function Card({cardInfo}) {
    const id = cardInfo.id;
    const {attributes, listeners, setNodeRef,
        transform, transition, isDragging} = useSortable({id});

    const style = {
        transition: isDragging ? undefined : transition,
        transform: CSS.Transform.toString(transform),
        opacity: isDragging ? 0.8 : 1,
    };

    return (
      <div className="card" ref={setNodeRef}
           {...attributes} {...listeners}
      style={style}>
          <div className="card-header">
            <h2>{cardInfo.title}</h2>
          </div>
          <p>{cardInfo.description}</p>
      </div>
    );
}

export default Card;