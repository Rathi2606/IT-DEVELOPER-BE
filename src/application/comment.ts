import { NextFunction, Request, Response } from "express";
import Comment from "../infrastructure/schemas/Comment";
import Card from "../infrastructure/schemas/Card";
import Board from "../infrastructure/schemas/Board";
import NotFoundError from "../domain/errors/not-found-error";
import ValidationError from "../domain/errors/validation-error";
import ForbiddenError from "../domain/errors/forbidden-error";
import { CreateCommentDTO, UpdateCommentDTO } from "../domain/dto/kanban";
import { createNotification } from "./notification";

export const createComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const commentData = CreateCommentDTO.safeParse(req.body);
    if (!commentData.success) {
      throw new ValidationError(commentData.error.message);
    }

    const userId = req.auth?.userId;
    if (!userId) {
      throw new ValidationError("User ID is required");
    }

    const { cardId } = commentData.data;

    // Verify card exists
    const card = await Card.findById(cardId);
    if (!card) {
      throw new NotFoundError("Card not found");
    }

    // Verify user has access to board
    const board = await Board.findById(card.boardId);
    if (!board) {
      throw new NotFoundError("Board not found");
    }

    if (board.userId !== userId) {
      const isMember = board.members.some((m: any) => m.userId === userId);
      if (!isMember) {
        throw new ForbiddenError("You don't have access to this board");
      }
    }

    const comment = await Comment.create({
      cardId,
      userId,
      userName: req.auth?.firstName || "User",
      userEmail: req.auth?.emailAddresses?.[0]?.emailAddress || "",
      content: commentData.data.content,
    });

    // Create notifications for assignees
    if (card.assignees && card.assignees.length > 0) {
      for (const assignee of card.assignees as any[]) {
        if (assignee.userId !== userId) {
          await createNotification({
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
  } catch (error) {
    next(error);
  }
};

export const getCommentsByCard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { cardId } = req.params;
    const userId = req.auth?.userId;

    const card = await Card.findById(cardId);
    if (!card) {
      throw new NotFoundError("Card not found");
    }

    // Verify user has access to board
    const board = await Board.findById(card.boardId);
    if (!board) {
      throw new NotFoundError("Board not found");
    }

    if (board.userId !== userId) {
      const isMember = board.members.some((m: any) => m.userId === userId);
      if (!isMember) {
        throw new ForbiddenError("You don't have access to this board");
      }
    }

    const comments = await Comment.find({ cardId }).sort({ createdAt: -1 });
    res.status(200).json(comments);
  } catch (error) {
    next(error);
  }
};

export const updateComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { commentId } = req.params;
    const userId = req.auth?.userId;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new NotFoundError("Comment not found");
    }

    if (comment.userId !== userId) {
      throw new ForbiddenError("Only comment author can update comment");
    }

    const updateData = UpdateCommentDTO.safeParse(req.body);
    if (!updateData.success) {
      throw new ValidationError(updateData.error.message);
    }

    await Comment.findByIdAndUpdate(commentId, {
      content: updateData.data.content,
      updatedAt: new Date(),
    });

    res.status(200).send();
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { commentId } = req.params;
    const userId = req.auth?.userId;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new NotFoundError("Comment not found");
    }

    if (comment.userId !== userId) {
      throw new ForbiddenError("Only comment author can delete comment");
    }

    await Comment.findByIdAndDelete(commentId);
    res.status(200).send();
  } catch (error) {
    next(error);
  }
};