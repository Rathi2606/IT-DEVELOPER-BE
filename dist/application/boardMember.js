"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBoardMembers = exports.removeMemberFromBoard = exports.updateMemberRole = exports.addMemberToBoard = void 0;
const clerk_sdk_node_1 = require("@clerk/clerk-sdk-node");
const Board_1 = __importDefault(require("../infrastructure/schemas/Board"));
const not_found_error_1 = __importDefault(require("../domain/errors/not-found-error"));
const validation_error_1 = __importDefault(require("../domain/errors/validation-error"));
const forbidden_error_1 = __importDefault(require("../domain/errors/forbidden-error"));
const kanban_1 = require("../domain/dto/kanban");
const notification_1 = require("./notification");
const clerk = (0, clerk_sdk_node_1.Clerk)({ secretKey: process.env.CLERK_SECRET_KEY });
const addMemberToBoard = async (req, res, next) => {
    try {
        const memberData = kanban_1.AddMemberDTO.safeParse(req.body);
        if (!memberData.success) {
            throw new validation_error_1.default(memberData.error.message);
        }
        const { boardId, email, role } = memberData.data;
        const userId = req.auth?.userId;
        const board = await Board_1.default.findById(boardId);
        if (!board) {
            throw new not_found_error_1.default("Board not found");
        }
        // Only board owner or admin can add members
        if (board.userId !== userId) {
            const member = board.members.find((m) => m.userId === userId);
            if (!member || member.role !== "admin") {
                throw new forbidden_error_1.default("Only board owner or admin can add members");
            }
        }
        // Check if member already exists
        const existingMember = board.members.find((m) => m.email === email);
        if (existingMember) {
            throw new validation_error_1.default("Member already exists in this board");
        }
        // Look up user by email using Clerk
        const users = await clerk.users.getUserList({ emailAddress: [email] });
        if (users.length === 0) {
            throw new validation_error_1.default("User with this email does not exist");
        }
        const clerkUser = users[0];
        const newMember = {
            userId: clerkUser.id,
            name: `${clerkUser.firstName} ${clerkUser.lastName || ''}`.trim(),
            email,
            role,
        };
        board.members.push(newMember);
        await board.save();
        // Create notification for new member
        await (0, notification_1.createNotification)({
            userId: newMember.userId,
            boardId: board._id,
            type: "member_added",
            title: "Added to board",
            message: `You have been added to "${board.name}"`,
            createdBy: {
                userId: userId,
                name: req.auth?.firstName || "Admin",
            },
        });
        res.status(201).json(newMember);
    }
    catch (error) {
        next(error);
    }
};
exports.addMemberToBoard = addMemberToBoard;
const updateMemberRole = async (req, res, next) => {
    try {
        const roleData = kanban_1.UpdateMemberRoleDTO.safeParse(req.body);
        if (!roleData.success) {
            throw new validation_error_1.default(roleData.error.message);
        }
        const { boardId, userId: targetUserId, role } = roleData.data;
        const userId = req.auth?.userId;
        const board = await Board_1.default.findById(boardId);
        if (!board) {
            throw new not_found_error_1.default("Board not found");
        }
        // Only board owner can update roles
        if (board.userId !== userId) {
            throw new forbidden_error_1.default("Only board owner can update member roles");
        }
        const member = board.members.find((m) => m.userId === targetUserId);
        if (!member) {
            throw new not_found_error_1.default("Member not found in this board");
        }
        member.role = role;
        await board.save();
        res.status(200).send();
    }
    catch (error) {
        next(error);
    }
};
exports.updateMemberRole = updateMemberRole;
const removeMemberFromBoard = async (req, res, next) => {
    try {
        const removeData = kanban_1.RemoveMemberDTO.safeParse(req.body);
        if (!removeData.success) {
            throw new validation_error_1.default(removeData.error.message);
        }
        const { boardId, userId: targetUserId } = removeData.data;
        const userId = req.auth?.userId;
        const board = await Board_1.default.findById(boardId);
        if (!board) {
            throw new not_found_error_1.default("Board not found");
        }
        // Only board owner or admin can remove members
        if (board.userId !== userId) {
            const member = board.members.find((m) => m.userId === userId);
            if (!member || member.role !== "admin") {
                throw new forbidden_error_1.default("Only board owner or admin can remove members");
            }
        }
        // Cannot remove board owner
        if (targetUserId === board.userId) {
            throw new forbidden_error_1.default("Cannot remove board owner");
        }
        board.members = board.members.filter((m) => m.userId !== targetUserId);
        await board.save();
        res.status(200).send();
    }
    catch (error) {
        next(error);
    }
};
exports.removeMemberFromBoard = removeMemberFromBoard;
const getBoardMembers = async (req, res, next) => {
    try {
        const { boardId } = req.params;
        const userId = req.auth?.userId;
        const board = await Board_1.default.findById(boardId);
        if (!board) {
            throw new not_found_error_1.default("Board not found");
        }
        // Verify user has access
        if (board.userId !== userId) {
            const isMember = board.members.some((m) => m.userId === userId);
            if (!isMember) {
                throw new forbidden_error_1.default("You don't have access to this board");
            }
        }
        res.status(200).json(board.members);
    }
    catch (error) {
        next(error);
    }
};
exports.getBoardMembers = getBoardMembers;
//# sourceMappingURL=boardMember.js.map