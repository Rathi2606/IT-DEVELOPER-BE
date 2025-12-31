import mongoose from "mongoose";

const columnSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  boardId: {
    type: mongoose.Schema.Types.ObjectId,
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

const Column = mongoose.model("Column", columnSchema);

export default Column;
