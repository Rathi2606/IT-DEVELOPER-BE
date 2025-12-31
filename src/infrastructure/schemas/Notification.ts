import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  boardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Board",
    required: true,
  },
  cardId: {
    type: mongoose.Schema.Types.ObjectId,
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

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;