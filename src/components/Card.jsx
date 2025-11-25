function Card({cardInfo}) {
    return (
      <div className="card">
          <h2>{cardInfo.title}</h2>
          <p>{cardInfo.description}</p>
      </div>
    );
}

export default Card;