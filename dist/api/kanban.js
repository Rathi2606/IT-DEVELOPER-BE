"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const kanban_1 = require("../application/kanban");
const boardMember_1 = require("../application/boardMember");
const comment_1 = require("../application/comment");
const notification_1 = require("../application/notification");
const authentication_middleware_1 = require("./middlewares/authentication-middleware");
const kanbanRouter = express_1.default.Router();
// Board Routes
kanbanRouter.post("/boards", authentication_middleware_1.isAuthenticated, kanban_1.createBoard);
kanbanRouter.get("/boards", authentication_middleware_1.isAuthenticated, kanban_1.getAllBoards);
kanbanRouter.get("/boards/:boardId", authentication_middleware_1.isAuthenticated, kanban_1.getBoardById);
kanbanRouter.put("/boards/:boardId", authentication_middleware_1.isAuthenticated, kanban_1.updateBoard);
kanbanRouter.delete("/boards/:boardId", authentication_middleware_1.isAuthenticated, kanban_1.deleteBoard);
// Column Routes
kanbanRouter.post("/columns", authentication_middleware_1.isAuthenticated, kanban_1.createColumn);
kanbanRouter.get("/boards/:boardId/columns", authentication_middleware_1.isAuthenticated, kanban_1.getColumnsByBoard);
kanbanRouter.put("/columns/:columnId", authentication_middleware_1.isAuthenticated, kanban_1.updateColumn);
kanbanRouter.delete("/columns/:columnId", authentication_middleware_1.isAuthenticated, kanban_1.deleteColumn);
// Card Routes
kanbanRouter.post("/cards", authentication_middleware_1.isAuthenticated, kanban_1.createCard);
kanbanRouter.get("/columns/:columnId/cards", authentication_middleware_1.isAuthenticated, kanban_1.getCardsByColumn);
kanbanRouter.get("/boards/:boardId/cards", authentication_middleware_1.isAuthenticated, kanban_1.getCardsByBoard);
kanbanRouter.put("/cards/:cardId", authentication_middleware_1.isAuthenticated, kanban_1.updateCard);
kanbanRouter.post("/cards/move", authentication_middleware_1.isAuthenticated, kanban_1.moveCard);
kanbanRouter.delete("/cards/:cardId", authentication_middleware_1.isAuthenticated, kanban_1.deleteCard);
// Board Member Routes
kanbanRouter.post("/boards/members", authentication_middleware_1.isAuthenticated, boardMember_1.addMemberToBoard);
kanbanRouter.get("/boards/:boardId/members", authentication_middleware_1.isAuthenticated, boardMember_1.getBoardMembers);
kanbanRouter.put("/boards/members/role", authentication_middleware_1.isAuthenticated, boardMember_1.updateMemberRole);
kanbanRouter.delete("/boards/members", authentication_middleware_1.isAuthenticated, boardMember_1.removeMemberFromBoard);
// Comment Routes
kanbanRouter.post("/comments", authentication_middleware_1.isAuthenticated, comment_1.createComment);
kanbanRouter.get("/cards/:cardId/comments", authentication_middleware_1.isAuthenticated, comment_1.getCommentsByCard);
kanbanRouter.put("/comments/:commentId", authentication_middleware_1.isAuthenticated, comment_1.updateComment);
kanbanRouter.delete("/comments/:commentId", authentication_middleware_1.isAuthenticated, comment_1.deleteComment);
// Notification Routes
kanbanRouter.get("/notifications", authentication_middleware_1.isAuthenticated, notification_1.getUserNotifications);
kanbanRouter.get("/notifications/unread/count", authentication_middleware_1.isAuthenticated, notification_1.getUnreadNotificationCount);
kanbanRouter.put("/notifications/:notificationId/read", authentication_middleware_1.isAuthenticated, notification_1.markNotificationAsRead);
kanbanRouter.put("/notifications/read-all", authentication_middleware_1.isAuthenticated, notification_1.markAllNotificationsAsRead);
exports.default = kanbanRouter;
//# sourceMappingURL=kanban.js.map