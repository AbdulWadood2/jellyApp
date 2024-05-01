const mongoose = require("mongoose");

// Define the schema for notifications
const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
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
  },
  { timestamps: true }
);

// Define a model using the schema
const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
