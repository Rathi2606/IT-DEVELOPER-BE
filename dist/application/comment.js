"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteComment = exports.updateComment = exports.getCommentsByCard = exports.createComment = void 0;
const Comment_1 = __importDefault(require("../infrastructure/schemas/Comment"));
const Card_1 = __importDefault(require("../infrastructure/schemas/Card"));
const Board_1 = __importDefault(require("../infrastructure/schemas/Board"));
const not_found_error_1 = __importDefault(require("../domain/errors/not-found-error"));
const validation_error_1 = __importDefault(require("../domain/errors/validation-error"));
const forbidden_error_1 = __importDefault(require("../domain/errors/forbidden-error"));
const kanban_1 = require("../domain/dto/kanban");
const notification_1 = require("./notification");
const createComment = async (req, res, next) => {
    try {
        const commentData = kanban_1.CreateCommentDTO.safeParse(req.body);
        if (!commentData.success) {
            throw new validation_error_1.default(commentData.error.message);
        }
        const userId = req.auth?.userId;
        if (!userId) {
            throw new validation_error_1.default("User ID is required");
        }
        const { cardId } = commentData.data;
        // Verify card exists
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
        const comment = await Comment_1.default.create({
            cardId,
            userId,
            userName: req.auth?.firstName || "User",
            userEmail: req.auth?.emailAddresses?.[0]?.emailAddress || "",
            content: commentData.data.content,
        });
        // Create notifications for assignees
        if (card.assignees && card.assignees.length > 0) {
            for (const assignee of card.assignees) {
                if (assignee.userId !== userId) {
                    await (0, notification_1.createNotification)({
                        userId: assignee.userId,
                        boardId: card.boardId,
                        cardId: card._id,
                        type: "comment_added",
                        title: "New comment on task",
                        message: `${req.auth?.firstName || "Someone"} commented on "${card.title}"`,
                        createdBy: {
                            userId,
                            name: req.auth?.firstName || "User",
                        },
                    });
                }
            }
        }
        res.status(201).json(comment);
    }
    catch (error) {
        next(error);
    }
};
exports.createComment = createComment;
const getCommentsByCard = async (req, res, next) => {
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
        const comments = await Comment_1.default.find({ cardId }).sort({ createdAt: -1 });
        res.status(200).json(comments);
    }
    catch (error) {
        next(error);
    }
};
exports.getCommentsByCard = getCommentsByCard;
const updateComment = async (req, res, next) => {
    try {
        const { commentId } = req.params;
        const userId = req.auth?.userId;
        const comment = await Comment_1.default.findById(commentId);
        if (!comment) {
            throw new not_found_error_1.default("Comment not found");
        }
        if (comment.userId !== userId) {
            throw new forbidden_error_1.default("Only comment author can update comment");
        }
        const updateData = kanban_1.UpdateCommentDTO.safeParse(req.body);
        if (!updateData.success) {
            throw new validation_error_1.default(updateData.error.message);
        }
        await Comment_1.default.findByIdAndUpdate(commentId, {
            content: updateData.data.content,
            updatedAt: new Date(),
        });
        res.status(200).send();
    }
    catch (error) {
        next(error);
    }
};
exports.updateComment = updateComment;
const deleteComment = async (req, res, next) => {
    try {
        const { commentId } = req.params;
        const userId = req.auth?.userId;
        const comment = await Comment_1.default.findById(commentId);
        if (!comment) {
            throw new not_found_error_1.default("Comment not found");
        }
        if (comment.userId !== userId) {
            throw new forbidden_error_1.default("Only comment author can delete comment");
        }
        await Comment_1.default.findByIdAndDelete(commentId);
        res.status(200).send();
    }
    catch (error) {
        next(error);
    }
};
exports.deleteComment = deleteComment;
//# sourceMappingURL=comment.js.map