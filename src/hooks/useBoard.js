import {useCallback, useEffect, useState} from "react";
import {createBoard, deleteBoard, getBoardById, getBoards} from "../api/taskboardAPI.js";


export function useBoard({authToken, handleUnauthorizedSession}) {
    const [isLoadingBoards, setIsLoadingBoards] = useState(false);
    const [hasLoadedBoards, setHasLoadedBoards] = useState(false);
    const [activeBoardId, setActiveBoardId] = useState(null);
    const [activeBoard, setActiveBoard] = useState(null);
    const [boardList, setBoardList] = useState([]);

    const hasBoards = boardList.length > 0;
    const isBoardReady =
        activeBoardId != null &&
        Number(activeBoard?.id) === Number(activeBoardId) &&
        Array.isArray(activeBoard?.columns);
    const isBootstrappingWorkspace =
        Boolean(authToken) &&
        (!hasLoadedBoards || isLoadingBoards || (hasBoards && activeBoardId != null && !isBoardReady));
    const canCreateCards = hasBoards && isBoardReady;

    const resetBoardState = useCallback(() => {
        setIsLoadingBoards(false);
        setHasLoadedBoards(false);
        setActiveBoardId(null);
        setActiveBoard(null);
        setBoardList([]);
        localStorage.removeItem("activeBoardId");
    }, []);

    const handleActiveBoardChange = useCallback((nextBoardId) => {
        setActiveBoardId(nextBoardId);
    }, []);

    function normalizeColumns(board) {
        const columnsOrder = ["BACKLOG", "TODO", "IN_PROGRESS", "COMPLETED"];
        if (Array.isArray(board.columns)) {
            const normColumns = [...board.columns].sort(
                (a, b) => columnsOrder.indexOf(a.type) - columnsOrder.indexOf(b.type));
            return {...board, columns: normColumns};
        }

        return board;
    }

    function resolveCardColumnType(card, columns) {
        const candidateColumnType =
            card?.columnId ??
            card?.columnType ??
            card?.column?.type ??
            null;

        if (candidateColumnType && columns.some((column) => column.type === candidateColumnType)) {
            return candidateColumnType;
        }

        return columns[0]?.type ?? null;
    }

    function appendCardsToBoard(board, newCards) {
        if (!board?.columns || newCards.length === 0) {
            return board;
        }

        return {
            ...board,
            columns: board.columns.map((column) => {
                const cardsForColumn = newCards.filter(
                    (card) => resolveCardColumnType(card, board.columns) === column.type,
                );

                if (cardsForColumn.length === 0) {
                    return column;
                }

                return {
                    ...column,
                    cards: [...column.cards, ...cardsForColumn],
                };
            }),
        };
    }

    async function handleCreateBoard(boardData) {
        try {
            const newBoard = await createBoard(boardData);

            // UseEffect will assign normalized board
            handleActiveBoardChange(newBoard.id);

            const freshBoards = await getBoards();
            setBoardList(freshBoards);

        } catch (error) {
            if (!handleUnauthorizedSession(error)) {
                console.error(error);
            }
        }
    }

    async function handleDeleteBoard() {
        if (activeBoardId == null) {
            return false;
        }

        const boardIdToDelete = Number(activeBoardId);
        const boardIndex = boardList.findIndex((board) => board.id === boardIdToDelete);
        const boardName = boardList.find((board) => board.id === boardIdToDelete)?.name ?? "this board";
        const confirmed = window.confirm(
            `Delete "${boardName}"? This will permanently remove the board and its cards.`,
        );

        if (!confirmed) {
            return false;
        }

        try {
            await deleteBoard(boardIdToDelete);

            const remainingBoards = boardList.filter((board) => board.id !== boardIdToDelete);
            setBoardList(remainingBoards);
            setActiveBoard(null);

            if (remainingBoards.length === 0) {
                handleActiveBoardChange(null);
                localStorage.removeItem("activeBoardId");
                return true;
            }

            const nextBoard =
                remainingBoards[Math.min(boardIndex, remainingBoards.length - 1)] ??
                remainingBoards[0];

            handleActiveBoardChange(nextBoard.id);
            return true;
        } catch (error) {
            if (!handleUnauthorizedSession(error)) {
                console.error(error);
            }
            return false;
        }
    }

    // Initial load: Fetching board list
    useEffect(() => {
        if (!authToken) {
            return;
        }

        let isCurrent = true;

        (async () => {
            setIsLoadingBoards(true);
            setHasLoadedBoards(false);

            const boardsSummary = await getBoards();
            if (!isCurrent) {
                return;
            }

            setBoardList(boardsSummary);

            if (!boardsSummary || boardsSummary.length === 0) {
                setActiveBoardId(null);
                setActiveBoard(null);
                localStorage.removeItem("activeBoardId");
                return;
            }

            const prevData = localStorage.getItem("activeBoardId");
            const prevBoardId = prevData ? Number(prevData) : null;

            const initId =
                prevBoardId && boardsSummary.some((b) => b.id === prevBoardId) ? prevBoardId :
                    boardsSummary[0].id;

            setActiveBoard(null);
            handleActiveBoardChange(initId);
        })()
            .catch((error) => {
                if (isCurrent && !handleUnauthorizedSession(error)) {
                    console.error(error);
                }
            })
            .finally(() => {
                if (!isCurrent) {
                    return;
                }

                setIsLoadingBoards(false);
                setHasLoadedBoards(true);
            });

        return () => {
            isCurrent = false;
        };
    }, [authToken, handleActiveBoardChange, handleUnauthorizedSession]);

    // If active board changes, grab the board accordingly.
    useEffect(() => {
        if (!authToken || activeBoardId == null) {
            return;
        }

        const id = Number(activeBoardId);
        if (Number.isNaN(id)) {
            return;
        }

        let isCurrent = true;

        localStorage.setItem("activeBoardId", String(id));

        (async () => {
            const board = await getBoardById(id);
            if (!isCurrent) {
                return;
            }

            const normBoard = normalizeColumns(board);
            setActiveBoard(normBoard);
        })().catch((error) => {
            if (isCurrent && !handleUnauthorizedSession(error)) {
                console.error(error);
            }
        });

        return () => {
            isCurrent = false;
        };
    }, [activeBoardId, authToken, handleUnauthorizedSession]);

    return {
        hasBoards,
        activeBoardId,
        activeBoard,
        boardList,
        isBoardReady,
        isBootstrappingWorkspace,
        canCreateCards,
        setActiveBoard,
        resetBoardState,
        handleActiveBoardChange,
        handleCreateBoard,
        handleDeleteBoard,
        normalizeColumns,
        appendCardsToBoard,
    };

}