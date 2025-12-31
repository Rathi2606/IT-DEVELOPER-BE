"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUnreadNotificationCount = exports.markAllNotificationsAsRead = exports.markNotificationAsRead = exports.getUserNotifications = exports.createNotification = void 0;
const Notification_1 = __importDefault(require("../infrastructure/schemas/Notification"));
const not_found_error_1 = __importDefault(require("../domain/errors/not-found-error"));
const validation_error_1 = __importDefault(require("../domain/errors/validation-error"));
const forbidden_error_1 = __importDefault(require("../domain/errors/forbidden-error"));
const createNotification = async (params) => {
    try {
        await Notification_1.default.create(params);
    }
    catch (error) {
        console.error("Error creating notification:", error);
    }
};
exports.createNotification = createNotification;
const getUserNotifications = async (req, res, next) => {
    try {
        const userId = req.auth?.userId;
        if (!userId) {
            throw new validation_error_1.default("User ID is required");
        }
        const notifications = await Notification_1.default.find({ userId })
            .sort({ createdAt: -1 })
            .limit(50);
        res.status(200).json(notifications);
    }
    catch (error) {
        next(error);
    }
};
exports.getUserNotifications = getUserNotifications;
const markNotificationAsRead = async (req, res, next) => {
    try {
        const { notificationId } = req.params;
        const userId = req.auth?.userId;
        const notification = await Notification_1.default.findById(notificationId);
        if (!notification) {
            throw new not_found_error_1.default("Notification not found");
        }
        if (notification.userId !== userId) {
            throw new forbidden_error_1.default("Unauthorized");
        }
        await Notification_1.default.findByIdAndUpdate(notificationId, { read: true });
        res.status(200).send();
    }
    catch (error) {
        next(error);
    }
};
exports.markNotificationAsRead = markNotificationAsRead;
const markAllNotificationsAsRead = async (req, res, next) => {
    try {
        const userId = req.auth?.userId;
        if (!userId) {
            throw new validation_error_1.default("User ID is required");
        }
        await Notification_1.default.updateMany({ userId, read: false }, { read: true });
        res.status(200).send();
    }
    catch (error) {
        next(error);
    }
};
exports.markAllNotificationsAsRead = markAllNotificationsAsRead;
const getUnreadNotificationCount = async (req, res, next) => {
    try {
        const userId = req.auth?.userId;
        if (!userId) {
            throw new validation_error_1.default("User ID is required");
        }
        const count = await Notification_1.default.countDocuments({ userId, read: false });
        res.status(200).json({ count });
    }
    catch (error) {
        next(error);
    }
};
exports.getUnreadNotificationCount = getUnreadNotificationCount;
//# sourceMappingURL=notification.js.map