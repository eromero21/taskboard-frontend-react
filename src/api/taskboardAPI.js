const URL = "http://localhost:8080/api";

export async function getBoard() {
    const response = await fetch(`${URL}/board`);

    if (!response.ok) {
        throw new Error(response.statusText + "\n Could not fetch board");
    }

    return response.json();
}

export async function getCards() {
    const response = await fetch(`${URL}/cards`);

    if (!response.ok) {
        throw new Error(response.statusText + "\n Could not fetch cards");
    }

    return response.json();
}

export async function createCard(cardInfo) {
    const response = await fetch(`${URL}/cards`,
        {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                title: cardInfo.title,
                description: cardInfo.description
            }),
        });

    if (!response.ok) {
        throw new Error(response.statusText + "\n Could not create card");
    }

    return response.json();
}

export async function editCard(cardId, cardInfo) {
    const response = await fetch(`${URL}/cards/${cardId}/edit`,
        {
            method: "PATCH",
            body: JSON.stringify({
                columnId: cardInfo.columnId,
                description: cardInfo.description,
                title: cardInfo.title,
            })
        });

    if (!response.ok) {
        throw new Error(response.statusText + "\n Could not update card");
    }

    return response.json();
}

export async function moveCard(cardId, cardInfo) {
    const response = await fetch(`${URL}/cards/${cardId}/move`,
        {
            method: "PATCH",
            body: JSON.stringify({
                columnId: cardInfo.columnId,
            })
        });

    if (!response.ok) {
        throw new Error(response.statusText + "\n Could not move card");
    }

    return response.json();
}

export async function deleteCard(cardId) {
    const response = await fetch(`${URL}/cards/${cardId}/delete`,
        {
            method: "DELETE"
        });

    if (!response.ok) {
        throw new Error(response.statusText + "\n Could not delete card");
    }

    return response.json();
}