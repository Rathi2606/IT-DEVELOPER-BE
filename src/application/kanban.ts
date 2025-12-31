import { NextFunction, Request, Response } from "express";
import Board from "../infrastructure/schemas/Board";
import Column from "../infrastructure/schemas/Column";
import Card from "../infrastructure/schemas/Card";
import NotFoundError from "../domain/errors/not-found-error";
import ValidationError from "../domain/errors/validation-error";
import ForbiddenError from "../domain/errors/forbidden-error";
import {
  CreateBoardDTO,
  UpdateBoardDTO,
  CreateColumnDTO,
  UpdateColumnDTO,
  CreateCardDTO,
  UpdateCardDTO,
  MoveCardDTO,
} from "../domain/dto/kanban";
import { createNotification } from "./notification";


export const createBoard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const boardData = CreateBoardDTO.safeParse(req.body);
    if (!boardData.success) {
      throw new ValidationError(boardData.error.message);
    }

    const userId = req.auth?.userId;
    if (!userId) {
      throw new ValidationError("User ID is required");
    }

    const board = await Board.create({
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
      await Column.create({
        title: defaultColumns[i],
        boardId: board._id,
        position: i,
      });
    }

    res.status(201).json({ id: board._id });
  } catch (error) {
    next(error);
  }
};

export const getAllBoards = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      throw new ValidationError("User ID is required");
    }

    const boards = await Board.find({ userId }).populate("members");
    res.status(200).json(boards);
  } catch (error) {
    next(error);
  }
};

export const getBoardById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { boardId } = req.params;
    const userId = req.auth?.userId;

    const board = await Board.findById(boardId).populate("members");
    if (!board) {
      throw new NotFoundError("Board not found");
    }

    // Check if user has access
    if (board.userId !== userId) {
      const isMember = board.members.some((m: any) => m.userId === userId);
      if (!isMember) {
        throw new ForbiddenError("You don't have access to this board");
      }
    }

    res.status(200).json(board);
  } catch (error) {
    next(error);
  }
};

export const updateBoard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { boardId } = req.params;
    const userId = req.auth?.userId;

    const board = await Board.findById(boardId);
    if (!board) {
      throw new NotFoundError("Board not found");
    }

    if (board.userId !== userId) {
      throw new ForbiddenError("Only board owner can update board");
    }

    const updateData = UpdateBoardDTO.safeParse(req.body);
    if (!updateData.success) {
      throw new ValidationError(updateData.error.message);
    }

    await Board.findByIdAndUpdate(boardId, updateData.data);
    res.status(200).send();
  } catch (error) {
    next(error);
  }
};

export const deleteBoard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { boardId } = req.params;
    const userId = req.auth?.userId;

    const board = await Board.findById(boardId);
    if (!board) {
      throw new NotFoundError("Board not found");
    }

    if (board.userId !== userId) {
      throw new ForbiddenError("Only board owner can delete board");
    }

    // Delete all columns and cards associated with this board
    const columns = await Column.find({ boardId });
    for (const column of columns) {
      await Card.deleteMany({ columnId: column._id });
    }
    await Column.deleteMany({ boardId });
    await Board.findByIdAndDelete(boardId);

    res.status(200).send();
  } catch (error) {
    next(error);
  }
};

// ============= COLUMN OPERATIONS =============

export const createColumn = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const columnData = CreateColumnDTO.safeParse(req.body);
    if (!columnData.success) {
      throw new ValidationError(columnData.error.message);
    }

    const { boardId } = columnData.data;
    const userId = req.auth?.userId;

    // Verify board exists and user has access
    const board = await Board.findById(boardId);
    if (!board) {
      throw new NotFoundError("Board not found");
    }

    if (board.userId !== userId) {
      const isMember = board.members.some((m: any) => m.userId === userId);
      if (!isMember) {
        throw new ForbiddenError("You don't have access to this board");
      }
    }

    const column = await Column.create({
      title: columnData.data.title,
      boardId,
      position: columnData.data.position || 0,
      color: columnData.data.color || "#FFFFFF",
    });

    res.status(201).json(column);
  } catch (error) {
    next(error);
  }
};

export const getColumnsByBoard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { boardId } = req.params;
    const userId = req.auth?.userId;

    // Verify user has access to board
    const board = await Board.findById(boardId);
    if (!board) {
      throw new NotFoundError("Board not found");
    }

    if (board.userId !== userId) {
      const isMember = board.members.some((m: any) => m.userId === userId);
      if (!isMember) {
        throw new ForbiddenError("You don't have access to this board");
      }
    }

    const columns = await Column.find({ boardId }).sort({ position: 1 });
    res.status(200).json(columns);
  } catch (error) {
    next(error);
  }
};

export const updateColumn = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { columnId } = req.params;
    const userId = req.auth?.userId;

    const column = await Column.findById(columnId);
    if (!column) {
      throw new NotFoundError("Column not found");
    }

    // Verify user has access to board
    const board = await Board.findById(column.boardId);
    if (!board) {
      throw new NotFoundError("Board not found");
    }

    if (board.userId !== userId) {
      const isMember = board.members.some((m: any) => m.userId === userId);
      if (!isMember) {
        throw new ForbiddenError("You don't have access to this board");
      }
    }

    const updateData = UpdateColumnDTO.safeParse(req.body);
    if (!updateData.success) {
      throw new ValidationError(updateData.error.message);
    }

    await Column.findByIdAndUpdate(columnId, updateData.data);
    res.status(200).send();
  } catch (error) {
    next(error);
  }
};

export const deleteColumn = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { columnId } = req.params;
    const userId = req.auth?.userId;

    const column = await Column.findById(columnId);
    if (!column) {
      throw new NotFoundError("Column not found");
    }

    // Verify user has access to board
    const board = await Board.findById(column.boardId);
    if (!board) {
      throw new NotFoundError("Board not found");
    }

    if (board.userId !== userId) {
      const isMember = board.members.some((m: any) => m.userId === userId);
      if (!isMember) {
        throw new ForbiddenError("You don't have access to this board");
      }
    }

    // Delete all cards in this column
    await Card.deleteMany({ columnId });
    await Column.findByIdAndDelete(columnId);

    res.status(200).send();
  } catch (error) {
    next(error);
  }
};

// ============= CARD OPERATIONS =============

export const createCard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const cardData = CreateCardDTO.safeParse(req.body);
    if (!cardData.success) {
      const errors = cardData.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ');
      throw new ValidationError(`Validation failed: ${errors}`);
    }

    const { boardId, columnId } = cardData.data;
    const userId = req.auth?.userId;

    // Verify board and column exist
    const board = await Board.findById(boardId);
    if (!board) {
      throw new NotFoundError("Board not found");
    }

    const column = await Column.findById(columnId);
    if (!column) {
      throw new NotFoundError("Column not found");
    }

    // Verify user has access
    if (board.userId !== userId) {
      const isMember = board.members.some((m: any) => m.userId === userId);
      if (!isMember) {
        throw new ForbiddenError("You don't have access to this board");
      }
    }

    const card = await Card.create({
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
    await Column.findByIdAndUpdate(
      columnId,
      { $inc: { cardCount: 1 } }
    );

    // Create notifications for assignees
    if (cardData.data.assignees && cardData.data.assignees.length > 0) {
      for (const assignee of cardData.data.assignees) {
        if (assignee.userId !== userId) {
          await createNotification({
            userId: assignee.userId,
            boardId,
            cardId: card._id,
            type: "task_assigned",
            title: "New task assigned",
            message: `You have been assigned to "${card.title}"`,
            createdBy: {
              userId: userId!,
              name: req.auth?.firstName || "User",
            },
          });
        }
      }
    }

    res.status(201).json(card);
  } catch (error) {
    next(error);
  }
};

export const getCardsByColumn = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { columnId } = req.params;
    const userId = req.auth?.userId;

    const column = await Column.findById(columnId);
    if (!column) {
      throw new NotFoundError("Column not found");
    }

    // Verify user has access to board
    const board = await Board.findById(column.boardId);
    if (!board) {
      throw new NotFoundError("Board not found");
    }

    if (board.userId !== userId) {
      const isMember = board.members.some((m: any) => m.userId === userId);
      if (!isMember) {
        throw new ForbiddenError("You don't have access to this board");
      }
    }

    const cards = await Card.find({ columnId }).sort({ position: 1 });
    res.status(200).json(cards);
  } catch (error) {
    next(error);
  }
};

export const getCardsByBoard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { boardId } = req.params;
    const userId = req.auth?.userId;

    const board = await Board.findById(boardId);
    if (!board) {
      throw new NotFoundError("Board not found");
    }

    if (board.userId !== userId) {
      const isMember = board.members.some((m: any) => m.userId === userId);
      if (!isMember) {
        throw new ForbiddenError("You don't have access to this board");
      }
    }

    const cards = await Card.find({ boardId }).sort({ position: 1 });
    res.status(200).json(cards);
  } catch (error) {
    next(error);
  }
};

export const updateCard = async (
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

    const updateData = UpdateCardDTO.safeParse(req.body);
    if (!updateData.success) {
      throw new ValidationError(updateData.error.message);
    }

    const parsedData = {
      ...updateData.data,
      ...(updateData.data.dueDate !== undefined && { dueDate: updateData.data.dueDate ? new Date(updateData.data.dueDate) : null }),
      updatedAt: new Date(),
    };

    if (updateData.data.columnId && updateData.data.columnId !== card.columnId.toString()) {
      await Column.findByIdAndUpdate(card.columnId, { $inc: { cardCount: -1 } });
      await Column.findByIdAndUpdate(updateData.data.columnId, { $inc: { cardCount: 1 } });
    }

    const updatedCard = await Card.findByIdAndUpdate(cardId, parsedData, { new: true });

    // Create notifications for assignees if task was updated
    if (updatedCard && updatedCard.assignees && updatedCard.assignees.length > 0) {
      for (const assignee of updatedCard.assignees as any[]) {
        if (assignee.userId !== userId) {
          await createNotification({
            userId: assignee.userId,
            boardId: updatedCard.boardId,
            cardId: updatedCard._id,
            type: "task_updated",
            title: "Task updated",
            message: `"${updatedCard.title}" has been updated`,
            createdBy: {
              userId: userId!,
              name: req.auth?.firstName || "User",
            },
          });
        }
      }
    }

    res.status(200).send();
  } catch (error) {
    next(error);
  }
};

export const moveCard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const moveData = MoveCardDTO.safeParse(req.body);
    if (!moveData.success) {
      throw new ValidationError(moveData.error.message);
    }

    const { cardId, fromColumnId, toColumnId, newPosition } = moveData.data;
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

    const oldPosition = card.position;

    // If moving within the same column
    if (fromColumnId === toColumnId) {
      if (oldPosition < newPosition) {
        // Moving down: decrement positions of cards between old and new position
        await Card.updateMany(
          { columnId: fromColumnId, position: { $gt: oldPosition, $lte: newPosition } },
          { $inc: { position: -1 } }
        );
      } else if (oldPosition > newPosition) {
        // Moving up: increment positions of cards between new and old position
        await Card.updateMany(
          { columnId: fromColumnId, position: { $gte: newPosition, $lt: oldPosition } },
          { $inc: { position: 1 } }
        );
      }
    } else {
      // Moving to different column
      // Remove from old column
      await Card.updateMany(
        { columnId: fromColumnId, position: { $gt: oldPosition } },
        { $inc: { position: -1 } }
      );

      // Make space in new column
      await Card.updateMany(
        { columnId: toColumnId, position: { $gte: newPosition } },
        { $inc: { position: 1 } }
      );

      // Update column counts
      await Column.findByIdAndUpdate(fromColumnId, {
        $inc: { cardCount: -1 },
      });
      await Column.findByIdAndUpdate(toColumnId, {
        $inc: { cardCount: 1 },
      });
    }

    // Update card position and column
    const movedCard = await Card.findByIdAndUpdate(cardId, {
      columnId: toColumnId,
      position: newPosition,
      updatedAt: new Date(),
    }, { new: true });

    // Create notifications for assignees
    if (movedCard && movedCard.assignees && movedCard.assignees.length > 0) {
      const fromColumn = await Column.findById(fromColumnId);
      const toColumn = await Column.findById(toColumnId);

      for (const assignee of movedCard.assignees as any[]) {
        if (assignee.userId !== userId) {
          await createNotification({
            userId: assignee.userId,
            boardId: movedCard.boardId,
            cardId: movedCard._id,
            type: "task_moved",
            title: "Task moved",
            message: `"${movedCard.title}" moved from ${fromColumn?.title} to ${toColumn?.title}`,
            createdBy: {
              userId: userId!,
              name: req.auth?.firstName || "User",
            },
          });
        }
      }
    }

    res.status(200).send();
  } catch (error) {
    next(error);
  }
};

export const deleteCard = async (
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

    // Update column card count
    await Column.findByIdAndUpdate(card.columnId, {
      $inc: { cardCount: -1 },
    });

    await Card.findByIdAndDelete(cardId);
    res.status(200).send();
  } catch (error) {
    next(error);
  }
};
