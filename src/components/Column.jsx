import Card from "./Card.jsx";
import {SortableContext} from "@dnd-kit/sortable";

function Column({columnData}) {
    return (
        <div className="column">
            <div className="column-header">
                <h2>{columnData.name}</h2>
            </div>
            <SortableContext className="column-cards" items={columnData.cards.map(cardData => cardData.id)}>
                {columnData.cards?.map((cardData) => (
                <Card key={cardData.id} cardInfo={cardData} />
                ))}
            </SortableContext>
        </div>
    )
}

export default Column;