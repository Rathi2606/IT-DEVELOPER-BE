import express from "express";
import {
  createBoard,
  getAllBoards,
  getBoardById,
  updateBoard,
  deleteBoard,
  createColumn,
  getColumnsByBoard,
  updateColumn,
  deleteColumn,
  createCard,
  getCardsByColumn,
  getCardsByBoard,
  updateCard,
  moveCard,
  deleteCard,
} from "../application/kanban";
import {
  addMemberToBoard,
  updateMemberRole,
  removeMemberFromBoard,
  getBoardMembers,
} from "../application/boardMember";
import {
  createComment,
  getCommentsByCard,
  updateComment,
  deleteComment,
} from "../application/comment";
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadNotificationCount,
} from "../application/notification";
import { isAuthenticated } from "./middlewares/authentication-middleware";

const kanbanRouter = express.Router();

// Board Routes
kanbanRouter.post("/boards", isAuthenticated, createBoard);
kanbanRouter.get("/boards", isAuthenticated, getAllBoards);
kanbanRouter.get("/boards/:boardId", isAuthenticated, getBoardById);
kanbanRouter.put("/boards/:boardId", isAuthenticated, updateBoard);
kanbanRouter.delete("/boards/:boardId", isAuthenticated, deleteBoard);

// Column Routes
kanbanRouter.post("/columns", isAuthenticated, createColumn);
kanbanRouter.get("/boards/:boardId/columns", isAuthenticated, getColumnsByBoard);
kanbanRouter.put("/columns/:columnId", isAuthenticated, updateColumn);
kanbanRouter.delete("/columns/:columnId", isAuthenticated, deleteColumn);

// Card Routes
kanbanRouter.post("/cards", isAuthenticated, createCard);
kanbanRouter.get("/columns/:columnId/cards", isAuthenticated, getCardsByColumn);
kanbanRouter.get("/boards/:boardId/cards", isAuthenticated, getCardsByBoard);
kanbanRouter.put("/cards/:cardId", isAuthenticated, updateCard);
kanbanRouter.post("/cards/move", isAuthenticated, moveCard);
kanbanRouter.delete("/cards/:cardId", isAuthenticated, deleteCard);

// Board Member Routes
kanbanRouter.post("/boards/members", isAuthenticated, addMemberToBoard);
kanbanRouter.get("/boards/:boardId/members", isAuthenticated, getBoardMembers);
kanbanRouter.put("/boards/members/role", isAuthenticated, updateMemberRole);
kanbanRouter.delete("/boards/members", isAuthenticated, removeMemberFromBoard);

// Comment Routes
kanbanRouter.post("/comments", isAuthenticated, createComment);
kanbanRouter.get("/cards/:cardId/comments", isAuthenticated, getCommentsByCard);
kanbanRouter.put("/comments/:commentId", isAuthenticated, updateComment);
kanbanRouter.delete("/comments/:commentId", isAuthenticated, deleteComment);

// Notification Routes
kanbanRouter.get("/notifications", isAuthenticated, getUserNotifications);
kanbanRouter.get("/notifications/unread/count", isAuthenticated, getUnreadNotificationCount);
kanbanRouter.put("/notifications/:notificationId/read", isAuthenticated, markNotificationAsRead);
kanbanRouter.put("/notifications/read-all", isAuthenticated, markAllNotificationsAsRead);

export default kanbanRouter;
