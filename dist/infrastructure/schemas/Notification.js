"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const notificationSchema = new mongoose_1.default.Schema({
    userId: {
        type: String,
        required: true,
        index: true,
    },
    boardId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Board",
        required: true,
    },
    cardId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Card",
    },
    type: {
        type: String,
        enum: ["task_assigned", "task_updated", "task_moved", "comment_added", "member_added", "due_date_reminder"],
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    read: {
        type: Boolean,
        default: false,
    },
    createdBy: {
        userId: String,
        name: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});
const Notification = mongoose_1.default.model("Notification", notificationSchema);
exports.default = Notification;
//# sourceMappingURL=Notification.js.map