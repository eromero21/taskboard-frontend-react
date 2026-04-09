import {useEffect, useRef, useState} from "react";

function LoginPage({onLogin, onRegister, notice = ""}) {
    const [mode, setMode] = useState("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState(notice);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const emailRef = useRef(null);

    useEffect(() => {
        emailRef.current?.focus();
    }, []);

    useEffect(() => {
        setErrorMessage(notice);
    }, [notice]);

    const isRegisterMode = mode === "register";

    async function handleSubmit(event) {
        event.preventDefault();

        const finalEmail = email.trim();
        const finalPassword = password.trim();
        const finalConfirmPassword = confirmPassword.trim();

        if (!finalEmail || !finalPassword) {
            setErrorMessage("Enter both email and password.");
            return;
        }

        if (isRegisterMode) {
            if (finalPassword.length < 8) {
                setErrorMessage("Password must be at least 8 characters.");
                return;
            }

            if (!finalConfirmPassword) {
                setErrorMessage("Confirm your password.");
                return;
            }

            if (finalPassword !== finalConfirmPassword) {
                setErrorMessage("Passwords do not match.");
                return;
            }
        }

        try {
            setIsSubmitting(true);
            setErrorMessage("");

            const credentials = {
                email: finalEmail,
                password: finalPassword,
            };

            if (isRegisterMode) {
                await onRegister(credentials);
            } else {
                await onLogin(credentials);
            }

            setPassword("");
            setConfirmPassword("");
        } catch (error) {
            setErrorMessage(error instanceof Error
                ? error.message
                : isRegisterMode
                    ? "Could not create your account."
                    : "Could not log in.");
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

    function handleModeChange(nextMode) {
        if (isSubmitting || nextMode === mode) {
            return;
        }

        setMode(nextMode);
        setPassword("");
        setConfirmPassword("");
        setErrorMessage(notice);
    }

    return (
        <div className="login-shell">
            <div className="login-panel">
                <div className="login-copy">
                    <p className="login-eyebrow">Taskboard</p>
                    <h1 className="login-title">
                        {isRegisterMode ? "Create your workspace account" : "Sign in to your workspace"}
                    </h1>
                    <p className="login-subtitle">
                        {isRegisterMode
                            ? "Register with the Taskboard backend to start creating boards and managing cards right away."
                            : "Log in to view boards, manage cards, and keep your tasks in sync."}
                    </p>
                </div>

                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="login-mode-switch" aria-label="Authentication mode">
                        <button
                            className={`login-mode-button${!isRegisterMode ? " active" : ""}`}
                            type="button"
                            onClick={() => handleModeChange("login")}
                        >
                            Sign In
                        </button>
                        <button
                            className={`login-mode-button${isRegisterMode ? " active" : ""}`}
                            type="button"
                            onClick={() => handleModeChange("register")}
                        >
                            Register
                        </button>
                    </div>

                    <label className="login-label">
                        Email
                        <input
                            ref={emailRef}
                            className="login-input"
                            type="email"
                            name="email"
                            autoComplete="email"
                            value={email}
                            onChange={handleChange(setEmail)}
                            placeholder="Enter your email"
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

                    {isRegisterMode && (
                        <label className="login-label">
                            Confirm Password
                            <input
                                className="login-input"
                                type="password"
                                name="confirmPassword"
                                autoComplete="new-password"
                                value={confirmPassword}
                                onChange={handleChange(setConfirmPassword)}
                                placeholder="Confirm your password"
                            />
                        </label>
                    )}

                    {isRegisterMode && (
                        <p className="login-helper-text">
                            Use at least 8 characters. Your account will be created in the connected Taskboard backend.
                        </p>
                    )}

                    {errorMessage && <p className="login-error">{errorMessage}</p>}

                    <button className="login-submit" type="submit" disabled={isSubmitting}>
                        {isSubmitting
                            ? (isRegisterMode ? "Creating account..." : "Signing in...")
                            : (isRegisterMode ? "Create Account" : "Log In")}
                    </button>

                    <p className="login-footer-text">
                        {isRegisterMode ? "Already have an account?" : "Need an account?"}{" "}
                        <button
                            className="login-text-button"
                            type="button"
                            onClick={() => handleModeChange(isRegisterMode ? "login" : "register")}
                        >
                            {isRegisterMode ? "Sign in instead" : "Register here"}
                        </button>
                    </p>
                </form>
            </div>
        </div>
    );
}

export default LoginPage;
