import {apiFetch, setAuthToken} from "./fetcherAuth.js";

const JSON_HEADERS = {"Content-Type": "application/json"};

export function getBoards() {
    return apiFetch("/boards");
}

export function getBoardById(boardId) {
    return apiFetch(`/boards/${boardId}`);
}

export function createBoard(boardName) {
    return apiFetch("/boards", {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify({
            name: boardName,
        }),
    });
}

export function createCard(boardId, cardInfo) {
    return apiFetch(`/boards/${boardId}/cards`, {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify({
            title: cardInfo.title,
            description: cardInfo.description,
        }),
    });
}

export function editCard(boardId, cardId, cardInfo) {
    return apiFetch(`/boards/${boardId}/cards/${cardId}/edit`, {
        method: "PATCH",
        headers: JSON_HEADERS,
        body: JSON.stringify({
            title: cardInfo.title,
            description: cardInfo.description,
        }),
    });
}

export function moveCard(boardId, cardId, cardInfo) {
    return apiFetch(`/boards/${boardId}/cards/${cardId}/move`, {
        method: "PATCH",
        headers: JSON_HEADERS,
        body: JSON.stringify({
            columnId: cardInfo.columnId,
        }),
    });
}

export function deleteCard(boardId, cardId) {
    return apiFetch(`/boards/${boardId}/cards/${cardId}/delete`, {
        method: "DELETE",
    });
}

async function authenticate(path, credentials) {
    const response = await apiFetch(path, {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify(credentials),
    }, null);

    const token = response?.token ?? response?.jwt ?? response?.accessToken;

    if (!token) {
        throw new Error("Login succeeded, but no auth token was returned.");
    }

    setAuthToken(token);
    return response;
}

export function login(credentials) {
    return authenticate("/auth/login", credentials);
}

export function register(credentials) {
    return authenticate("/auth/register", credentials);
}
