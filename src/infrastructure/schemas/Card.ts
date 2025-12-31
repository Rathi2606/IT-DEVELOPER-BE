import mongoose from "mongoose";

const cardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  assignees: [
    {
      userId: String,
      name: String,
      initials: String,
    }
  ],
  dueDate: {
    type: Date,
    default: null,
  },
  priority: {
    type: String,
    enum: ["Low", "Medium", "High"],
    default: "Medium",
  },
  labels: [String],
  subtasks: [
    {
      title: { type: String, required: true },
      completed: { type: Boolean, default: false }
    }
  ],
  attachments: [
    {
      name: { type: String },
      url: { type: String, required: true },
      type: { type: String }
    }
  ],
  progress: { type: Number, default: 0, min: 0, max: 100 },
  columnId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Column",
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

const Card = mongoose.model("Card", cardSchema);

export default Card;
