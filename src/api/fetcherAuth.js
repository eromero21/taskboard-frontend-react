const URL = import.meta.env.VITE_API_BASE_URL;
const TOKEN_STORAGE_KEY = "taskboard.authToken";
const LEGACY_TOKEN_STORAGE_KEY = "authToken";

console.log("API URL:", import.meta.env.VITE_API_BASE_URL);

function normalizeToken(token) {
    if (typeof token !== "string") {
        return null;
    }

    const normalizedToken = token.trim();
    if (!normalizedToken || normalizedToken === "null" || normalizedToken === "undefined") {
        return null;
    }

    return normalizedToken;
}

function resolveToken(token) {
    if (token !== undefined) {
        return normalizeToken(token);
    }

    return getAuthToken();
}

export function getAuthToken() {
    return normalizeToken(localStorage.getItem(TOKEN_STORAGE_KEY));
}

export function setAuthToken(token) {
    const normalizedToken = normalizeToken(token);

    if (!normalizedToken) {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(LEGACY_TOKEN_STORAGE_KEY);
        return;
    }

    localStorage.setItem(TOKEN_STORAGE_KEY, normalizedToken);
    localStorage.removeItem(LEGACY_TOKEN_STORAGE_KEY);
}

export function clearAuthToken() {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(LEGACY_TOKEN_STORAGE_KEY);
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
        let errorDetails = "";

        try {
            const contentType = response.headers.get("content-type") || "";
            if (contentType.includes("application/json")) {
                const payload = await response.json();
                const validationErrors = payload?.validationErrors && typeof payload.validationErrors === "object"
                    ? Object.values(payload.validationErrors).filter(Boolean)
                    : [];

                errorDetails = [
                    payload?.message,
                    ...validationErrors,
                ].filter(Boolean).join("\n");

                if (!errorDetails) {
                    errorDetails = JSON.stringify(payload);
                }
            } else {
                errorDetails = await response.text();
            }
        } catch {
            errorDetails = "";
        }

        const error = new Error(
            `${response.status} ${response.statusText}${errorDetails ? `\n${errorDetails}` : ""}`,
        );
        error.status = response.status;
        throw error;
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
}
