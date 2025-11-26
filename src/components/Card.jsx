import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function Card({cardInfo}) {
    const id = cardInfo.id;
    const {attributes, listeners, setNodeRef,
        transform, transition} = useSortable({id});

    const style = {
        transition,
        transform: CSS.Transform.toString(transform),
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