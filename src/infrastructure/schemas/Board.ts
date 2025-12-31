import mongoose from "mongoose";

const boardSchema = new mongoose.Schema({
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

const Board = mongoose.model("Board", boardSchema);

export default Board;
