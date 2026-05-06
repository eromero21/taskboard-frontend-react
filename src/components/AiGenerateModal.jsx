import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faRotateRight, faWandMagicSparkles, faX} from "@fortawesome/free-solid-svg-icons";
import {useEffect, useRef, useState} from "react";

function AiGenerateModal({display, onClose, onGenerate, onApply}) {
    const modalRef = useRef(null);
    const [projectIdea, setProjectIdea] = useState("");
    const [generatedTasks, setGeneratedTasks] = useState([]);
    const [keptTaskIds, setKeptTaskIds] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [isApplying, setIsApplying] = useState(false);

    useEffect(() => {
        if (!display) {
            setProjectIdea("");
            setGeneratedTasks([]);
            setKeptTaskIds([]);
            setErrorMessage("");
            setIsGenerating(false);
            setIsApplying(false);
            return;
        }

        modalRef.current?.focus();
    }, [display]);

    if (!display) {
        return null;
    }

    function isTaskKept(taskId) {
        return keptTaskIds.includes(taskId);
    }

    function toggleTask(taskId) {
        setKeptTaskIds((currentTaskIds) => (
            currentTaskIds.includes(taskId)
                ? currentTaskIds.filter((currentId) => currentId !== taskId)
                : [...currentTaskIds, taskId]
        ));
    }

    async function handleGenerate(event) {
        event.preventDefault();

        const finalProjectIdea = projectIdea.trim();
        if (!finalProjectIdea) {
            setErrorMessage("Enter a project idea so AI can suggest tasks.");
            return;
        }

        setIsGenerating(true);
        setErrorMessage("");

        try {
            const tasks = await onGenerate(finalProjectIdea);
            const preparedTasks = tasks.map((task, index) => ({
                ...task,
                localId: `${task.id ?? "generated"}-${index}-${Date.now()}`,
            }));

            setGeneratedTasks(preparedTasks);
            setKeptTaskIds(preparedTasks.map((task) => task.localId));
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "Unable to generate tasks.");
        } finally {
            setIsGenerating(false);
        }
    }

    async function handleApply() {
        const keptTasks = generatedTasks
            .filter((task) => isTaskKept(task.localId))
            .map((task) => ({
                title: task.title,
                description: task.description || "Generated from AI.",
            }));

        if (keptTasks.length === 0) {
            setErrorMessage("Keep at least one generated task before adding them.");
            return;
        }

        setIsApplying(true);
        setErrorMessage("");

        try {
            const didApply = await onApply(keptTasks);
            if (didApply !== false) {
                onClose();
            }
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "Unable to add the generated tasks.");
        } finally {
            setIsApplying(false);
        }
    }

    return (
        <div className="create-card-backdrop" onClick={onClose}>
            <div
                className="create-card ai-generate-modal"
                ref={modalRef}
                tabIndex={-1}
                onClick={(event) => event.stopPropagation()}
            >
                <h1 className="create-card-header">AI Generate Tasks</h1>
                <button className="create-card-close" onClick={onClose} type="button">
                    <FontAwesomeIcon icon={faX} />
                </button>

                <form className="create-card-fields ai-generate-fields" onSubmit={handleGenerate}>
                    <label>
                        Describe your project idea
                        <textarea
                            name="projectIdea"
                            className="create-card-description ai-generate-prompt"
                            placeholder="Example: Build a portfolio website with an about page, projects gallery, and contact form."
                            rows={5}
                            maxLength={700}
                            value={projectIdea}
                            onChange={(event) => setProjectIdea(event.target.value)}
                            disabled={isGenerating || isApplying}
                        />
                    </label>

                    <div className="ai-generate-actions">
                        <button className="create-card-submit" type="submit" disabled={isGenerating || isApplying}>
                            <FontAwesomeIcon icon={faWandMagicSparkles} />
                            {isGenerating ? "Generating..." : "Generate 5 Tasks"}
                        </button>
                        {generatedTasks.length > 0 && (
                            <button type="button" onClick={handleApply} disabled={isGenerating || isApplying}>
                                {isApplying ? "Adding Tasks..." : "Add Kept Tasks"}
                            </button>
                        )}
                    </div>

                    {errorMessage && <p className="login-error">{errorMessage}</p>}

                    {generatedTasks.length > 0 && (
                        <div className="ai-generated-results">
                            <div className="ai-generated-results-header">
                                <h2>Choose which tasks to keep</h2>
                                <p>{keptTaskIds.length} of {generatedTasks.length} selected</p>
                            </div>

                            <div className="ai-generated-task-list">
                                {generatedTasks.map((task) => {
                                    const kept = isTaskKept(task.localId);

                                    return (
                                        <article
                                            key={task.localId}
                                            className={`ai-generated-task${kept ? "" : " is-discarded"}`}
                                        >
                                            <div className="ai-generated-task-copy">
                                                <h3>{task.title}</h3>
                                                <p>{task.description || "No description provided."}</p>
                                            </div>

                                            <button
                                                type="button"
                                                className={`ai-generated-toggle ${kept ? "is-discard-action" : "is-keep-action"}`}
                                                onClick={() => toggleTask(task.localId)}
                                                disabled={isApplying}
                                            >
                                                {kept ? "Discard" : "Keep"}
                                            </button>
                                        </article>
                                    );
                                })}
                            </div>

                            <button
                                type="button"
                                className="ai-generate-secondary"
                                onClick={handleGenerate}
                                disabled={isGenerating || isApplying}
                            >
                                <FontAwesomeIcon icon={faRotateRight} />
                                Regenerate Suggestions
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}

export default AiGenerateModal;
