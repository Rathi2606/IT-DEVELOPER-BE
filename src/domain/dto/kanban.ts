import { z } from "zod";

// Board DTOs
export const CreateBoardDTO = z.object({
  name: z.string().min(1, "Board name is required"),
  description: z.string().optional(),
});

export const UpdateBoardDTO = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
});

// Column DTOs
export const CreateColumnDTO = z.object({
  title: z.string().min(1, "Column title is required"),
  boardId: z.string(),
  position: z.number().optional(),
  color: z.string().optional(),
});

export const UpdateColumnDTO = z.object({
  title: z.string().optional(),
  position: z.number().optional(),
  color: z.string().optional(),
});

// Card DTOs
export const CreateCardDTO = z.object({
  title: z.string().min(1, "Card title is required"),
  description: z.string().optional(),
  columnId: z.string(),
  boardId: z.string(),
  dueDate: z.string().optional(),
  priority: z.enum(["Low", "Medium", "High"]).optional(),
  assignees: z.array(z.object({
    userId: z.string(),
    name: z.string(),
    initials: z.string(),
  })).optional(),
  labels: z.array(z.string()).optional(),
  subtasks: z.array(z.object({
    title: z.string().min(1),
    completed: z.boolean().default(false)
  })).optional(),
  attachments: z.array(z.object({
    name: z.string().optional(),
    url: z.string().min(1),
    type: z.string().optional()
  })).optional(),
  progress: z.number().min(0).max(100).optional(),
  position: z.number().optional(),
});

export const UpdateCardDTO = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  columnId: z.string().optional(),
  dueDate: z.string().optional(),
  priority: z.enum(["Low", "Medium", "High"]).optional(),
  assignees: z.array(z.object({
    userId: z.string(),
    name: z.string(),
    initials: z.string(),
  })).optional(),
  labels: z.array(z.string()).optional(),
  subtasks: z.array(z.object({
    title: z.string().min(1),
    completed: z.boolean().default(false)
  })).optional(),
  attachments: z.array(z.object({
    name: z.string().optional(),
    url: z.string().min(1),
    type: z.string().optional()
  })).optional(),
  progress: z.number().min(0).max(100).optional(),
  position: z.number().optional(),
});

export const MoveCardDTO = z.object({
  fromColumnId: z.string(),
  toColumnId: z.string(),
  cardId: z.string(),
  newPosition: z.number(),
});

// Board Member DTOs
export const AddMemberDTO = z.object({
  boardId: z.string(),
  email: z.string().email(),
  role: z.enum(["admin", "member"]).default("member"),
});

export const UpdateMemberRoleDTO = z.object({
  boardId: z.string(),
  userId: z.string(),
  role: z.enum(["admin", "member"]),
});

export const RemoveMemberDTO = z.object({
  boardId: z.string(),
  userId: z.string(),
});

// Comment DTOs
export const CreateCommentDTO = z.object({
  cardId: z.string(),
  content: z.string().min(1, "Comment content is required"),
});

export const UpdateCommentDTO = z.object({
  content: z.string().min(1, "Comment content is required"),
});

// Notification DTOs
export const MarkNotificationReadDTO = z.object({
  notificationId: z.string(),
});
