"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const boardSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: "",
    },
    userId: {
        type: String,
        required: true,
    },
    members: [
        {
            userId: String,
            name: String,
            email: String,
            role: {
                type: String,
                enum: ["admin", "member"],
                default: "member",
            }
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    }
});
const Board = mongoose_1.default.model("Board", boardSchema);
exports.default = Board;
//# sourceMappingURL=Board.js.map