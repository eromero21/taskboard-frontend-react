const URL = "http://localhost:8080";

export async function getBoards() {
    const response = await fetch(`${URL}/boards`);

    if (!response.ok) {
        throw new Error(response.statusText + "\n Could not fetch boards");
    }

    return response.json();
}

export async function getBoardById(boardId) {
    const response = await fetch(`${URL}/boards/${boardId}`);

    if (!response.ok) {
        throw new Error(response.statusText + "\n Could not fetch board with given ID.");
    }

    return response.json();
}

export async function createBoard(boardName) {
    const response = await fetch(`${URL}/boards`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            name: boardName,
        }),
    });

    if (!response.ok) {
        throw new Error(response.statusText + "\n Could not create board");
    }

    return response.json();
}

export async function createCard(boardId, cardInfo) {
    const response = await fetch(`${URL}/boards/${boardId}/cards`,
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

export async function editCard(boardId, cardId, cardInfo) {
    const response = await fetch(`${URL}/boards/${boardId}/cards/${cardId}/edit`,
        {
            method: "PATCH",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                title: cardInfo.title,
                description: cardInfo.description,
            })
        });

    if (!response.ok) {
        throw new Error(response.statusText + "\n Could not update card");
    }

    return response.json();
}

export async function moveCard(boardId, cardId, cardInfo) {
    const response = await fetch(`${URL}/boards/${boardId}/cards/${cardId}/move`,
        {
            method: "PATCH",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                columnId: cardInfo.columnId,
            })
        });

    if (!response.ok) {
        throw new Error(response.statusText + "\n Could not move card");
    }

    return response.json();
}

export async function deleteCard(boardId, cardId) {
    const response = await fetch(`${URL}/boards/${boardId}/cards/${cardId}/delete`,
        {
            method: "DELETE"
        });

    if (response.status !== 204) {
        throw new Error(response.statusText + "\n Could not delete card");
    }

    console.log("Deletion successful.");
}