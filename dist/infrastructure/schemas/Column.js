"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const columnSchema = new mongoose_1.default.Schema({
    title: {
        type: String,
        required: true,
    },
    boardId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Board",
        required: true,
    },
    position: {
        type: Number,
        default: 0,
    },
    color: {
        type: String,
        default: "#FFFFFF",
    },
    cardCount: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    }
});
const Column = mongoose_1.default.model("Column", columnSchema);
exports.default = Column;
//# sourceMappingURL=Column.js.map