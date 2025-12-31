import { NextFunction, Request, Response } from "express";
import Notification from "../infrastructure/schemas/Notification";
import NotFoundError from "../domain/errors/not-found-error";
import ValidationError from "../domain/errors/validation-error";
import ForbiddenError from "../domain/errors/forbidden-error";
import { MarkNotificationReadDTO } from "../domain/dto/kanban";

interface CreateNotificationParams {
  userId: string;
  boardId: any;
  cardId?: any;
  type: string;
  title: string;
  message: string;
  createdBy?: {
    userId: string;
    name: string;
  };
}

export const createNotification = async (params: CreateNotificationParams) => {
  try {
    await Notification.create(params);
  } catch (error) {
    console.error("Error creating notification:", error);
  }
};

export const getUserNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      throw new ValidationError("User ID is required");
    }

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json(notifications);
  } catch (error) {
    next(error);
  }
};

export const markNotificationAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { notificationId } = req.params;
    const userId = req.auth?.userId;

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      throw new NotFoundError("Notification not found");
    }

    if (notification.userId !== userId) {
      throw new ForbiddenError("Unauthorized");
    }

    await Notification.findByIdAndUpdate(notificationId, { read: true });
    res.status(200).send();
  } catch (error) {
    next(error);
  }
};

export const markAllNotificationsAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      throw new ValidationError("User ID is required");
    }

    await Notification.updateMany({ userId, read: false }, { read: true });
    res.status(200).send();
  } catch (error) {
    next(error);
  }
};

export const getUnreadNotificationCount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      throw new ValidationError("User ID is required");
    }

    const count = await Notification.countDocuments({ userId, read: false });
    res.status(200).json({ count });
  } catch (error) {
    next(error);
  }
};