import {useEffect, useRef, useState} from "react";

function LoginPage({onLogin, notice = ""}) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState(notice);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const usernameRef = useRef(null);

    useEffect(() => {
        usernameRef.current?.focus();
    }, []);

    useEffect(() => {
        setErrorMessage(notice);
    }, [notice]);

    async function handleSubmit(event) {
        event.preventDefault();

        const finalUsername = username.trim();
        const finalPassword = password.trim();

        if (!finalUsername || !finalPassword) {
            setErrorMessage("Enter both username and password.");
            return;
        }

        try {
            setIsSubmitting(true);
            setErrorMessage("");
            await onLogin({
                username: finalUsername,
                password: finalPassword,
            });
            setPassword("");
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "Could not log in.");
        } finally {
            setIsSubmitting(false);
        }
    }

    function handleChange(setter) {
        return (event) => {
            setter(event.target.value);
            if (errorMessage) {
                setErrorMessage("");
            }
        };
    }

    return (
        <div className="login-shell">
            <div className="login-panel">
                <div className="login-copy">
                    <p className="login-eyebrow">Taskboard</p>
                    <h1 className="login-title">Sign in to your workspace</h1>
                    <p className="login-subtitle">
                        Log in to view boards, manage cards, and keep your tasks in sync.
                    </p>
                </div>

                <form className="login-form" onSubmit={handleSubmit}>
                    <label className="login-label">
                        Username
                        <input
                            ref={usernameRef}
                            className="login-input"
                            type="text"
                            name="username"
                            autoComplete="username"
                            value={username}
                            onChange={handleChange(setUsername)}
                            placeholder="Enter your username"
                        />
                    </label>

                    <label className="login-label">
                        Password
                        <input
                            className="login-input"
                            type="password"
                            name="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={handleChange(setPassword)}
                            placeholder="Enter your password"
                        />
                    </label>

                    {errorMessage && <p className="login-error">{errorMessage}</p>}

                    <button className="login-submit" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Signing in..." : "Log In"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default LoginPage;
