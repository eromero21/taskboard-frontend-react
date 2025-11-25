import Card from "./Card.jsx";

function Column({columnData}) {
    return (
        <div className="column">
            <div className="column-header">
                <h2>{columnData.name}</h2>
            </div>
            <div className="column-cards">
                {columnData.cards?.map((cardData) => (
                <Card key={cardData.id} cardInfo={cardData} />
                ))}
            </div>
        </div>
    )
}

export default Column;