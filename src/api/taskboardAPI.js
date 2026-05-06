import {apiFetch, setAuthToken} from "./fetcherAuth.js";

const JSON_HEADERS = {"Content-Type": "application/json"};

function normalizeGeneratedTask(task, index) {
    if (!task || typeof task !== "object") {
        return null;
    }

    const title = String(
        task.title ??
        "",
    ).trim();

    if (!title) {
        return null;
    }

    return {
        id: String(task.id ?? `generated-${index}`),
        title,
        description: String(task.description ?? task.details ?? task.reasoning ?? "").trim(),
    };
}

function normalizeGeneratedTasks(payload) {
    const candidates = payload?.tasks ?? [];

    if (!Array.isArray(candidates)) {
        return [];
    }

    return candidates
        .map(normalizeGeneratedTask)
        .filter(Boolean)
        .slice(0, 5);
}

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

export async function deleteBoard(boardId) {
    try {
        return await apiFetch(`/boards/${boardId}/delete`, {
            method: "DELETE",
        });
    } catch (error) {
        const status = error instanceof Error && typeof error.status === "number"
            ? error.status
            : null;

        // Support either the existing custom delete route or a REST-style DELETE /boards/{id}.
        if (status !== 403 && status !== 404 && status !== 405) {
            throw error;
        }

        return apiFetch(`/boards/${boardId}`, {
            method: "DELETE",
        });
    }
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

export async function generateTaskSuggestions(projectIdea) {
    const response = await apiFetch("/ai/generate-tasks", {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify({
            projectIdea,
        }),
    });

    const tasks = normalizeGeneratedTasks(response);
    if (tasks.length === 0) {
        throw new Error("The AI task generation endpoint returned no tasks.");
    }

    return tasks;
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
