const URL = "http://localhost:8080";
const TOKEN_STORAGE_KEY = "authToken";

function resolveToken(token) {
    if (token !== undefined) {
        return token;
    }

    return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function getAuthToken() {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setAuthToken(token) {
    if (!token) {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        return;
    }

    localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearAuthToken() {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export function authHeaders(token, extra = {}) {
    const resolvedToken = resolveToken(token);

    return {
        ...extra,
        ...(resolvedToken ? { Authorization: `Bearer ${resolvedToken}` } : {}),
    };
}

export async function apiFetch(path, options = {}, token) {
    const response = await fetch(`${URL}${path}`, {
        ...options,
        headers: authHeaders(token, options.headers || {}),
    });

    if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(`${response.status} ${response.statusText}${text ? `\n${text}` : ""}`);
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
}
