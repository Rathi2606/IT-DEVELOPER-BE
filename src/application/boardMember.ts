import { NextFunction, Request, Response } from "express";
import { Clerk } from "@clerk/clerk-sdk-node";
import Board from "../infrastructure/schemas/Board";
import NotFoundError from "../domain/errors/not-found-error";
import ValidationError from "../domain/errors/validation-error";
import ForbiddenError from "../domain/errors/forbidden-error";
import { AddMemberDTO, UpdateMemberRoleDTO, RemoveMemberDTO } from "../domain/dto/kanban";
import { createNotification } from "./notification";

const clerk = Clerk({ secretKey: process.env.CLERK_SECRET_KEY });

export const addMemberToBoard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const memberData = AddMemberDTO.safeParse(req.body);
    if (!memberData.success) {
      throw new ValidationError(memberData.error.message);
    }

    const { boardId, email, role } = memberData.data;
    const userId = req.auth?.userId;

    const board = await Board.findById(boardId);
    if (!board) {
      throw new NotFoundError("Board not found");
    }

    // Only board owner or admin can add members
    if (board.userId !== userId) {
      const member = board.members.find((m: any) => m.userId === userId);
      if (!member || member.role !== "admin") {
        throw new ForbiddenError("Only board owner or admin can add members");
      }
    }

    // Check if member already exists
    const existingMember = board.members.find((m: any) => m.email === email);
    if (existingMember) {
      throw new ValidationError("Member already exists in this board");
    }

    // Look up user by email using Clerk
    const users = await clerk.users.getUserList({ emailAddress: [email] });
    if (users.length === 0) {
      throw new ValidationError("User with this email does not exist");
    }

    const clerkUser = users[0];
    const newMember = {
      userId: clerkUser.id,
      name: `${clerkUser.firstName} ${clerkUser.lastName || ''}`.trim(),
      email,
      role,
    };

    board.members.push(newMember as any);
    await board.save();

    // Create notification for new member
    await createNotification({
      userId: newMember.userId,
      boardId: board._id,
      type: "member_added",
      title: "Added to board",
      message: `You have been added to "${board.name}"`,
      createdBy: {
        userId: userId!,
        name: req.auth?.firstName || "Admin",
      },
    });

    res.status(201).json(newMember);
  } catch (error) {
    next(error);
  }
};

export const updateMemberRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const roleData = UpdateMemberRoleDTO.safeParse(req.body);
    if (!roleData.success) {
      throw new ValidationError(roleData.error.message);
    }

    const { boardId, userId: targetUserId, role } = roleData.data;
    const userId = req.auth?.userId;

    const board = await Board.findById(boardId);
    if (!board) {
      throw new NotFoundError("Board not found");
    }

    // Only board owner can update roles
    if (board.userId !== userId) {
      throw new ForbiddenError("Only board owner can update member roles");
    }

    const member = board.members.find((m: any) => m.userId === targetUserId);
    if (!member) {
      throw new NotFoundError("Member not found in this board");
    }

    member.role = role;
    await board.save();

    res.status(200).send();
  } catch (error) {
    next(error);
  }
};

export const removeMemberFromBoard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const removeData = RemoveMemberDTO.safeParse(req.body);
    if (!removeData.success) {
      throw new ValidationError(removeData.error.message);
    }

    const { boardId, userId: targetUserId } = removeData.data;
    const userId = req.auth?.userId;

    const board = await Board.findById(boardId);
    if (!board) {
      throw new NotFoundError("Board not found");
    }

    // Only board owner or admin can remove members
    if (board.userId !== userId) {
      const member = board.members.find((m: any) => m.userId === userId);
      if (!member || member.role !== "admin") {
        throw new ForbiddenError("Only board owner or admin can remove members");
      }
    }

    // Cannot remove board owner
    if (targetUserId === board.userId) {
      throw new ForbiddenError("Cannot remove board owner");
    }

    const memberIndex = board.members.findIndex((m: any) => m.userId === targetUserId);
    if (memberIndex !== -1) {
      board.members.splice(memberIndex, 1);
    }
    await board.save();

    res.status(200).send();
  } catch (error) {
    next(error);
  }
};

export const getBoardMembers = async (
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

    // Verify user has access
    if (board.userId !== userId) {
      const isMember = board.members.some((m: any) => m.userId === userId);
      if (!isMember) {
        throw new ForbiddenError("You don't have access to this board");
      }
    }

    res.status(200).json(board.members as any);
  } catch (error) {
    next(error);
  }
};