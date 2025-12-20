import Card from "./Card.jsx";
import {SortableContext} from "@dnd-kit/sortable";
import {useDroppable} from "@dnd-kit/core";

function Column({columnData, onEdit}) {
    const {setNodeRef} = useDroppable({
        id: columnData.id,
    })

    return (
        <div className="column" ref={setNodeRef}>
            <div className="column-header">
                <h2>{columnData.name}</h2>
            </div>
            <div className="column-cards">
                <SortableContext id={columnData.id} items={columnData.cards.map(cardData => cardData.id)}>
                    {columnData.cards?.map((cardData) => (
                    <Card key={cardData.id} cardInfo={cardData} onEdit={onEdit} />
                ))}
                </SortableContext>
            </div>
        </div>
    )
}

export default Column;