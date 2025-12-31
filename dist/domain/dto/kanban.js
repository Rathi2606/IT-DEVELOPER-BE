"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarkNotificationReadDTO = exports.UpdateCommentDTO = exports.CreateCommentDTO = exports.RemoveMemberDTO = exports.UpdateMemberRoleDTO = exports.AddMemberDTO = exports.MoveCardDTO = exports.UpdateCardDTO = exports.CreateCardDTO = exports.UpdateColumnDTO = exports.CreateColumnDTO = exports.UpdateBoardDTO = exports.CreateBoardDTO = void 0;
const zod_1 = require("zod");
// Board DTOs
exports.CreateBoardDTO = zod_1.z.object({
    name: zod_1.z.string().min(1, "Board name is required"),
    description: zod_1.z.string().optional(),
});
exports.UpdateBoardDTO = zod_1.z.object({
    name: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
});
// Column DTOs
exports.CreateColumnDTO = zod_1.z.object({
    title: zod_1.z.string().min(1, "Column title is required"),
    boardId: zod_1.z.string(),
    position: zod_1.z.number().optional(),
    color: zod_1.z.string().optional(),
});
exports.UpdateColumnDTO = zod_1.z.object({
    title: zod_1.z.string().optional(),
    position: zod_1.z.number().optional(),
    color: zod_1.z.string().optional(),
});
// Card DTOs
exports.CreateCardDTO = zod_1.z.object({
    title: zod_1.z.string().min(1, "Card title is required"),
    description: zod_1.z.string().optional(),
    columnId: zod_1.z.string(),
    boardId: zod_1.z.string(),
    dueDate: zod_1.z.string().optional(),
    priority: zod_1.z.enum(["Low", "Medium", "High"]).optional(),
    assignees: zod_1.z.array(zod_1.z.object({
        userId: zod_1.z.string(),
        name: zod_1.z.string(),
        initials: zod_1.z.string(),
    })).optional(),
    labels: zod_1.z.array(zod_1.z.string()).optional(),
    subtasks: zod_1.z.array(zod_1.z.object({
        title: zod_1.z.string().min(1),
        completed: zod_1.z.boolean().default(false)
    })).optional(),
    attachments: zod_1.z.array(zod_1.z.object({
        name: zod_1.z.string().optional(),
        url: zod_1.z.string().min(1),
        type: zod_1.z.string().optional()
    })).optional(),
    progress: zod_1.z.number().min(0).max(100).optional(),
    position: zod_1.z.number().optional(),
});
exports.UpdateCardDTO = zod_1.z.object({
    title: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    columnId: zod_1.z.string().optional(),
    dueDate: zod_1.z.string().optional(),
    priority: zod_1.z.enum(["Low", "Medium", "High"]).optional(),
    assignees: zod_1.z.array(zod_1.z.object({
        userId: zod_1.z.string(),
        name: zod_1.z.string(),
        initials: zod_1.z.string(),
    })).optional(),
    labels: zod_1.z.array(zod_1.z.string()).optional(),
    subtasks: zod_1.z.array(zod_1.z.object({
        title: zod_1.z.string().min(1),
        completed: zod_1.z.boolean().default(false)
    })).optional(),
    attachments: zod_1.z.array(zod_1.z.object({
        name: zod_1.z.string().optional(),
        url: zod_1.z.string().min(1),
        type: zod_1.z.string().optional()
    })).optional(),
    progress: zod_1.z.number().min(0).max(100).optional(),
    position: zod_1.z.number().optional(),
});
exports.MoveCardDTO = zod_1.z.object({
    fromColumnId: zod_1.z.string(),
    toColumnId: zod_1.z.string(),
    cardId: zod_1.z.string(),
    newPosition: zod_1.z.number(),
});
// Board Member DTOs
exports.AddMemberDTO = zod_1.z.object({
    boardId: zod_1.z.string(),
    email: zod_1.z.string().email(),
    role: zod_1.z.enum(["admin", "member"]).default("member"),
});
exports.UpdateMemberRoleDTO = zod_1.z.object({
    boardId: zod_1.z.string(),
    userId: zod_1.z.string(),
    role: zod_1.z.enum(["admin", "member"]),
});
exports.RemoveMemberDTO = zod_1.z.object({
    boardId: zod_1.z.string(),
    userId: zod_1.z.string(),
});
// Comment DTOs
exports.CreateCommentDTO = zod_1.z.object({
    cardId: zod_1.z.string(),
    content: zod_1.z.string().min(1, "Comment content is required"),
});
exports.UpdateCommentDTO = zod_1.z.object({
    content: zod_1.z.string().min(1, "Comment content is required"),
});
// Notification DTOs
exports.MarkNotificationReadDTO = zod_1.z.object({
    notificationId: zod_1.z.string(),
});
//# sourceMappingURL=kanban.js.map