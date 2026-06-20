import {useCallback, useState} from "react";
import {getAuthToken, clearAuthToken} from "../api/fetcherAuth.js";
import {login, register} from "../api/taskboardAPI.js";

function getErrorStatus(error) {
    if (!(error instanceof Error)) {
        return null;
    }

    if (typeof error.status === "number") {
        return error.status;
    }

    const match = error.message.match(/^(\d{3})\b/);
    return match ? Number(match[1]) : null;
}

function isUnauthorizedError(error, includeForbidden = true) {
    const status = getErrorStatus(error);
    return status === 401 || (includeForbidden && status === 403);
}

export function useAuth() {
    const [authToken, setAuthToken] = useState(() => getAuthToken());
    const [authNotice, setAuthNotice] = useState("");

    async function handleLogin(credentials) {
        await login(credentials);

        setAuthToken(getAuthToken());
        setAuthNotice("");
    }

    async function handleLogout() {
        clearAuthToken();
        setAuthToken(null);
        setAuthNotice("");
    }

    async function handleRegister(credentials) {
        await register(credentials);

        setAuthToken(getAuthToken());
        setAuthNotice("");
    }

    const handleUnauthorizedSession = useCallback((error, options = {}) => {
        const {includeForbidden = true} = options;

        if (!isUnauthorizedError(error, includeForbidden)) {
            return false;
        }

        clearAuthToken();
        setAuthToken(null);
        setAuthNotice("Your session expired. Please log in again.");
        return true;
    });

    return {
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
        authToken,
        authNotice,
        handleUnauthorizedSession
    };
}