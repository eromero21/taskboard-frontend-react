import Card from "./Card.jsx";
import {SortableContext} from "@dnd-kit/sortable";
import {useDroppable} from "@dnd-kit/core";

function Column({columnData, onEdit, onDelete}) {
    const {setNodeRef} = useDroppable({
        id: columnData.type,
    })

    return (
        <div className="column" ref={setNodeRef}>
            <div className="column-header">
                <h2>{columnData.name}</h2>
            </div>
            <div className="column-cards">
                <SortableContext id={columnData.type} items={columnData.cards.map(cardData => cardData.id)}>
                    {columnData.cards?.map((cardData) => (
                    <Card key={cardData.id} cardInfo={cardData} onEdit={onEdit} onDelete={onDelete} />
                ))}
                </SortableContext>
            </div>
        </div>
    )
}

export default Column;