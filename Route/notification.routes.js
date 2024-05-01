const express = require("express");
const router = express.Router();
const {
  protect,
  isAdmin,
  allVerify,
} = require("../utils/athentication.Controller");
const {
  createNotification,
  getAllNotifications,
  getNotificationById,
  updateNotification,
  deleteNotification,
} = require("../Controller/notification.controller");

// Notification routes

// endPoint /api/v1/notifications
// method POST
// @privacy all can do this
router.route("/").post(isAdmin, createNotification);

// Endpoint: /api/v1/notifications
// Method: GET
// Privacy: User only
router.route("/").get(allVerify, getAllNotifications);

module.exports = router;
