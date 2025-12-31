"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCard = exports.moveCard = exports.updateCard = exports.getCardsByBoard = exports.getCardsByColumn = exports.createCard = exports.deleteColumn = exports.updateColumn = exports.getColumnsByBoard = exports.createColumn = exports.deleteBoard = exports.updateBoard = exports.getBoardById = exports.getAllBoards = exports.createBoard = void 0;
const Board_1 = __importDefault(require("../infrastructure/schemas/Board"));
const Column_1 = __importDefault(require("../infrastructure/schemas/Column"));
const Card_1 = __importDefault(require("../infrastructure/schemas/Card"));
const not_found_error_1 = __importDefault(require("../domain/errors/not-found-error"));
const validation_error_1 = __importDefault(require("../domain/errors/validation-error"));
const forbidden_error_1 = __importDefault(require("../domain/errors/forbidden-error"));
const kanban_1 = require("../domain/dto/kanban");
const notification_1 = require("./notification");
const createBoard = async (req, res, next) => {
    try {
        const boardData = kanban_1.CreateBoardDTO.safeParse(req.body);
        if (!boardData.success) {
            throw new validation_error_1.default(boardData.error.message);
        }
        const userId = req.auth?.userId;
        if (!userId) {
            throw new validation_error_1.default("User ID is required");
        }
        const board = await Board_1.default.create({
            name: boardData.data.name,
            description: boardData.data.description || "",
            userId,
            members: [
                {
                    userId,
                    name: req.auth?.firstName || "User",
                    email: req.auth?.emailAddresses?.[0]?.emailAddress || "",
                    role: "admin",
                },
            ],
        });
        // Create default columns
        const defaultColumns = ["To Do", "In Progress", "Done"];
        for (let i = 0; i < defaultColumns.length; i++) {
            await Column_1.default.create({
                title: defaultColumns[i],
                boardId: board._id,
                position: i,
            });
        }
        res.status(201).json({ id: board._id });
    }
    catch (error) {
        next(error);
    }
};
exports.createBoard = createBoard;
const getAllBoards = async (req, res, next) => {
    try {
        const userId = req.auth?.userId;
        if (!userId) {
            throw new validation_error_1.default("User ID is required");
        }
        const boards = await Board_1.default.find({ userId }).populate("members");
        res.status(200).json(boards);
    }
    catch (error) {
        next(error);
    }
};
exports.getAllBoards = getAllBoards;
const getBoardById = async (req, res, next) => {
    try {
        const { boardId } = req.params;
        const userId = req.auth?.userId;
        const board = await Board_1.default.findById(boardId).populate("members");
        if (!board) {
            throw new not_found_error_1.default("Board not found");
        }
        // Check if user has access
        if (board.userId !== userId) {
            const isMember = board.members.some((m) => m.userId === userId);
            if (!isMember) {
                throw new forbidden_error_1.default("You don't have access to this board");
            }
        }
        res.status(200).json(board);
    }
    catch (error) {
        next(error);
    }
};
exports.getBoardById = getBoardById;
const updateBoard = async (req, res, next) => {
    try {
        const { boardId } = req.params;
        const userId = req.auth?.userId;
        const board = await Board_1.default.findById(boardId);
        if (!board) {
            throw new not_found_error_1.default("Board not found");
        }
        if (board.userId !== userId) {
            throw new forbidden_error_1.default("Only board owner can update board");
        }
        const updateData = kanban_1.UpdateBoardDTO.safeParse(req.body);
        if (!updateData.success) {
            throw new validation_error_1.default(updateData.error.message);
        }
        await Board_1.default.findByIdAndUpdate(boardId, updateData.data);
        res.status(200).send();
    }
    catch (error) {
        next(error);
    }
};
exports.updateBoard = updateBoard;
const deleteBoard = async (req, res, next) => {
    try {
        const { boardId } = req.params;
        const userId = req.auth?.userId;
        const board = await Board_1.default.findById(boardId);
        if (!board) {
            throw new not_found_error_1.default("Board not found");
        }
        if (board.userId !== userId) {
            throw new forbidden_error_1.default("Only board owner can delete board");
        }
        // Delete all columns and cards associated with this board
        const columns = await Column_1.default.find({ boardId });
        for (const column of columns) {
            await Card_1.default.deleteMany({ columnId: column._id });
        }
        await Column_1.default.deleteMany({ boardId });
        await Board_1.default.findByIdAndDelete(boardId);
        res.status(200).send();
    }
    catch (error) {
        next(error);
    }
};
exports.deleteBoard = deleteBoard;
// ============= COLUMN OPERATIONS =============
const createColumn = async (req, res, next) => {
    try {
        const columnData = kanban_1.CreateColumnDTO.safeParse(req.body);
        if (!columnData.success) {
            throw new validation_error_1.default(columnData.error.message);
        }
        const { boardId } = columnData.data;
        const userId = req.auth?.userId;
        // Verify board exists and user has access
        const board = await Board_1.default.findById(boardId);
        if (!board) {
            throw new not_found_error_1.default("Board not found");
        }
        if (board.userId !== userId) {
            const isMember = board.members.some((m) => m.userId === userId);
            if (!isMember) {
                throw new forbidden_error_1.default("You don't have access to this board");
            }
        }
        const column = await Column_1.default.create({
            title: columnData.data.title,
            boardId,
            position: columnData.data.position || 0,
            color: columnData.data.color || "#FFFFFF",
        });
        res.status(201).json(column);
    }
    catch (error) {
        next(error);
    }
};
exports.createColumn = createColumn;
const getColumnsByBoard = async (req, res, next) => {
    try {
        const { boardId } = req.params;
        const userId = req.auth?.userId;
        // Verify user has access to board
        const board = await Board_1.default.findById(boardId);
        if (!board) {
            throw new not_found_error_1.default("Board not found");
        }
        if (board.userId !== userId) {
            const isMember = board.members.some((m) => m.userId === userId);
            if (!isMember) {
                throw new forbidden_error_1.default("You don't have access to this board");
            }
        }
        const columns = await Column_1.default.find({ boardId }).sort({ position: 1 });
        res.status(200).json(columns);
    }
    catch (error) {
        next(error);
    }
};
exports.getColumnsByBoard = getColumnsByBoard;
const updateColumn = async (req, res, next) => {
    try {
        const { columnId } = req.params;
        const userId = req.auth?.userId;
        const column = await Column_1.default.findById(columnId);
        if (!column) {
            throw new not_found_error_1.default("Column not found");
        }
        // Verify user has access to board
        const board = await Board_1.default.findById(column.boardId);
        if (!board) {
            throw new not_found_error_1.default("Board not found");
        }
        if (board.userId !== userId) {
            const isMember = board.members.some((m) => m.userId === userId);
            if (!isMember) {
                throw new forbidden_error_1.default("You don't have access to this board");
            }
        }
        const updateData = kanban_1.UpdateColumnDTO.safeParse(req.body);
        if (!updateData.success) {
            throw new validation_error_1.default(updateData.error.message);
        }
        await Column_1.default.findByIdAndUpdate(columnId, updateData.data);
        res.status(200).send();
    }
    catch (error) {
        next(error);
    }
};
exports.updateColumn = updateColumn;
const deleteColumn = async (req, res, next) => {
    try {
        const { columnId } = req.params;
        const userId = req.auth?.userId;
        const column = await Column_1.default.findById(columnId);
        if (!column) {
            throw new not_found_error_1.default("Column not found");
        }
        // Verify user has access to board
        const board = await Board_1.default.findById(column.boardId);
        if (!board) {
            throw new not_found_error_1.default("Board not found");
        }
        if (board.userId !== userId) {
            const isMember = board.members.some((m) => m.userId === userId);
            if (!isMember) {
                throw new forbidden_error_1.default("You don't have access to this board");
            }
        }
        // Delete all cards in this column
        await Card_1.default.deleteMany({ columnId });
        await Column_1.default.findByIdAndDelete(columnId);
        res.status(200).send();
    }
    catch (error) {
        next(error);
    }
};
exports.deleteColumn = deleteColumn;
// ============= CARD OPERATIONS =============
const createCard = async (req, res, next) => {
    try {
        const cardData = kanban_1.CreateCardDTO.safeParse(req.body);
        if (!cardData.success) {
            const errors = cardData.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ');
            throw new validation_error_1.default(`Validation failed: ${errors}`);
        }
        const { boardId, columnId } = cardData.data;
        const userId = req.auth?.userId;
        // Verify board and column exist
        const board = await Board_1.default.findById(boardId);
        if (!board) {
            throw new not_found_error_1.default("Board not found");
        }
        const column = await Column_1.default.findById(columnId);
        if (!column) {
            throw new not_found_error_1.default("Column not found");
        }
        // Verify user has access
        if (board.userId !== userId) {
            const isMember = board.members.some((m) => m.userId === userId);
            if (!isMember) {
                throw new forbidden_error_1.default("You don't have access to this board");
            }
        }
        const card = await Card_1.default.create({
            title: cardData.data.title,
            description: cardData.data.description || "",
            columnId,
            boardId,
            dueDate: cardData.data.dueDate ? new Date(cardData.data.dueDate) : null,
            priority: cardData.data.priority || "Medium",
            assignees: cardData.data.assignees || [],
            labels: cardData.data.labels || [],
            subtasks: cardData.data.subtasks || [],
            attachments: cardData.data.attachments || [],
            progress: cardData.data.progress || 0,
            position: cardData.data.position || 0,
        });
        // Update column card count
        await Column_1.default.findByIdAndUpdate(columnId, { $inc: { cardCount: 1 } });
        // Create notifications for assignees
        if (cardData.data.assignees && cardData.data.assignees.length > 0) {
            for (const assignee of cardData.data.assignees) {
                if (assignee.userId !== userId) {
                    await (0, notification_1.createNotification)({
                        userId: assignee.userId,
                        boardId,
                        cardId: card._id,
                        type: "task_assigned",
                        title: "New task assigned",
                        message: `You have been assigned to "${card.title}"`,
                        createdBy: {
                            userId: userId,
                            name: req.auth?.firstName || "User",
                        },
                    });
                }
            }
        }
        res.status(201).json(card);
    }
    catch (error) {
        next(error);
    }
};
exports.createCard = createCard;
const getCardsByColumn = async (req, res, next) => {
    try {
        const { columnId } = req.params;
        const userId = req.auth?.userId;
        const column = await Column_1.default.findById(columnId);
        if (!column) {
            throw new not_found_error_1.default("Column not found");
        }
        // Verify user has access to board
        const board = await Board_1.default.findById(column.boardId);
        if (!board) {
            throw new not_found_error_1.default("Board not found");
        }
        if (board.userId !== userId) {
            const isMember = board.members.some((m) => m.userId === userId);
            if (!isMember) {
                throw new forbidden_error_1.default("You don't have access to this board");
            }
        }
        const cards = await Card_1.default.find({ columnId }).sort({ position: 1 });
        res.status(200).json(cards);
    }
    catch (error) {
        next(error);
    }
};
exports.getCardsByColumn = getCardsByColumn;
const getCardsByBoard = async (req, res, next) => {
    try {
        const { boardId } = req.params;
        const userId = req.auth?.userId;
        const board = await Board_1.default.findById(boardId);
        if (!board) {
            throw new not_found_error_1.default("Board not found");
        }
        if (board.userId !== userId) {
            const isMember = board.members.some((m) => m.userId === userId);
            if (!isMember) {
                throw new forbidden_error_1.default("You don't have access to this board");
            }
        }
        const cards = await Card_1.default.find({ boardId }).sort({ position: 1 });
        res.status(200).json(cards);
    }
    catch (error) {
        next(error);
    }
};
exports.getCardsByBoard = getCardsByBoard;
const updateCard = async (req, res, next) => {
    try {
        const { cardId } = req.params;
        const userId = req.auth?.userId;
        const card = await Card_1.default.findById(cardId);
        if (!card) {
            throw new not_found_error_1.default("Card not found");
        }
        // Verify user has access to board
        const board = await Board_1.default.findById(card.boardId);
        if (!board) {
            throw new not_found_error_1.default("Board not found");
        }
        if (board.userId !== userId) {
            const isMember = board.members.some((m) => m.userId === userId);
            if (!isMember) {
                throw new forbidden_error_1.default("You don't have access to this board");
            }
        }
        const updateData = kanban_1.UpdateCardDTO.safeParse(req.body);
        if (!updateData.success) {
            throw new validation_error_1.default(updateData.error.message);
        }
        const parsedData = {
            ...updateData.data,
            ...(updateData.data.dueDate !== undefined && { dueDate: updateData.data.dueDate ? new Date(updateData.data.dueDate) : null }),
            updatedAt: new Date(),
        };
        if (updateData.data.columnId && updateData.data.columnId !== card.columnId.toString()) {
            await Column_1.default.findByIdAndUpdate(card.columnId, { $inc: { cardCount: -1 } });
            await Column_1.default.findByIdAndUpdate(updateData.data.columnId, { $inc: { cardCount: 1 } });
        }
        const updatedCard = await Card_1.default.findByIdAndUpdate(cardId, parsedData, { new: true });
        // Create notifications for assignees if task was updated
        if (updatedCard && updatedCard.assignees && updatedCard.assignees.length > 0) {
            for (const assignee of updatedCard.assignees) {
                if (assignee.userId !== userId) {
                    await (0, notification_1.createNotification)({
                        userId: assignee.userId,
                        boardId: updatedCard.boardId,
                        cardId: updatedCard._id,
                        type: "task_updated",
                        title: "Task updated",
                        message: `"${updatedCard.title}" has been updated`,
                        createdBy: {
                            userId: userId,
                            name: req.auth?.firstName || "User",
                        },
                    });
                }
            }
        }
        res.status(200).send();
    }
    catch (error) {
        next(error);
    }
};
exports.updateCard = updateCard;
const moveCard = async (req, res, next) => {
    try {
        const moveData = kanban_1.MoveCardDTO.safeParse(req.body);
        if (!moveData.success) {
            throw new validation_error_1.default(moveData.error.message);
        }
        const { cardId, fromColumnId, toColumnId, newPosition } = moveData.data;
        const userId = req.auth?.userId;
        const card = await Card_1.default.findById(cardId);
        if (!card) {
            throw new not_found_error_1.default("Card not found");
        }
        // Verify user has access to board
        const board = await Board_1.default.findById(card.boardId);
        if (!board) {
            throw new not_found_error_1.default("Board not found");
        }
        if (board.userId !== userId) {
            const isMember = board.members.some((m) => m.userId === userId);
            if (!isMember) {
                throw new forbidden_error_1.default("You don't have access to this board");
            }
        }
        const oldPosition = card.position;
        // If moving within the same column
        if (fromColumnId === toColumnId) {
            if (oldPosition < newPosition) {
                // Moving down: decrement positions of cards between old and new position
                await Card_1.default.updateMany({ columnId: fromColumnId, position: { $gt: oldPosition, $lte: newPosition } }, { $inc: { position: -1 } });
            }
            else if (oldPosition > newPosition) {
                // Moving up: increment positions of cards between new and old position
                await Card_1.default.updateMany({ columnId: fromColumnId, position: { $gte: newPosition, $lt: oldPosition } }, { $inc: { position: 1 } });
            }
        }
        else {
            // Moving to different column
            // Remove from old column
            await Card_1.default.updateMany({ columnId: fromColumnId, position: { $gt: oldPosition } }, { $inc: { position: -1 } });
            // Make space in new column
            await Card_1.default.updateMany({ columnId: toColumnId, position: { $gte: newPosition } }, { $inc: { position: 1 } });
            // Update column counts
            await Column_1.default.findByIdAndUpdate(fromColumnId, {
                $inc: { cardCount: -1 },
            });
            await Column_1.default.findByIdAndUpdate(toColumnId, {
                $inc: { cardCount: 1 },
            });
        }
        // Update card position and column
        const movedCard = await Card_1.default.findByIdAndUpdate(cardId, {
            columnId: toColumnId,
            position: newPosition,
            updatedAt: new Date(),
        }, { new: true });
        // Create notifications for assignees
        if (movedCard && movedCard.assignees && movedCard.assignees.length > 0) {
            const fromColumn = await Column_1.default.findById(fromColumnId);
            const toColumn = await Column_1.default.findById(toColumnId);
            for (const assignee of movedCard.assignees) {
                if (assignee.userId !== userId) {
                    await (0, notification_1.createNotification)({
                        userId: assignee.userId,
                        boardId: movedCard.boardId,
                        cardId: movedCard._id,
                        type: "task_moved",
                        title: "Task moved",
                        message: `"${movedCard.title}" moved from ${fromColumn?.title} to ${toColumn?.title}`,
                        createdBy: {
                            userId: userId,
                            name: req.auth?.firstName || "User",
                        },
                    });
                }
            }
        }
        res.status(200).send();
    }
    catch (error) {
        next(error);
    }
};
exports.moveCard = moveCard;
const deleteCard = async (req, res, next) => {
    try {
        const { cardId } = req.params;
        const userId = req.auth?.userId;
        const card = await Card_1.default.findById(cardId);
        if (!card) {
            throw new not_found_error_1.default("Card not found");
        }
        // Verify user has access to board
        const board = await Board_1.default.findById(card.boardId);
        if (!board) {
            throw new not_found_error_1.default("Board not found");
        }
        if (board.userId !== userId) {
            const isMember = board.members.some((m) => m.userId === userId);
            if (!isMember) {
                throw new forbidden_error_1.default("You don't have access to this board");
            }
        }
        // Update column card count
        await Column_1.default.findByIdAndUpdate(card.columnId, {
            $inc: { cardCount: -1 },
        });
        await Card_1.default.findByIdAndDelete(cardId);
        res.status(200).send();
    }
    catch (error) {
        next(error);
    }
};
exports.deleteCard = deleteCard;
//# sourceMappingURL=kanban.js.map