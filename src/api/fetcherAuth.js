const URL = import.meta.env.VITE_API_BASE_URL;
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
