// status code
const { StatusCodes } = require("http-status-codes");
// axios
const axios = require("axios");
// models
const Notification = require("../Model/notification.model");
// utility functions
const { convertAllToValidTime } = require("../functions/utility.functions");

// Create a new notification
// endPoint /api/v1/notifications
// method POST
// @privacy admin can do this
async function sendFCMNotification(data, fcmServerKey) {
  try {
    axios
      .post("https://fcm.googleapis.com/fcm/send", data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `key=${fcmServerKey}`,
        },
      })
      .then((response) => {
        console.log("Successfully sent message:", response.data);
      })
      .catch((error) => {
        console.error("Error sending message:", error.response);
      });
  } catch (error) {
    console.error("Error sending message:", error);
  }
}
const createNotification = async (req, res, next) => {
  try {
    const { title, message } = req.body;
    // let users = await User.aggregate([
    //   // Match documents where fcmKey exists and is not null
    //   { $match: { fcmKey: { $exists: true, $ne: null } } },
    //   // Group documents and push fcmKey into an array
    //   {
    //     $group: {
    //       _id: null,
    //       fcmKeys: { $push: "$fcmKey" },
    //     },
    //   },
    // ]);

    const data = {
      notification: {
        title: req.body.title,
        body: req.body.description,
      },
      data: {
        title: req.body.title,
        body: req.body.description,
      },
      to: "/topics/default",
    };

    await sendFCMNotification(data, process.env.fcmServerKey);
    // Create the notification in the database
    let notification = await Notification.create({
      userId: req.user.id,
      title,
      message,
    });
    notification = convertAllToValidTime([notification], req, "notifications");
    // Return success response with the created notification
    res.status(StatusCodes.CREATED).json({
      success: true,
      data: notification[0],
    });
  } catch (error) {
    // Handle errors and return appropriate response
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: error.message,
      fullError: error.stack,
    });
  }
};

// Endpoint: /api/v1/notifications
// Method: GET
// Privacy: User only
const getAllNotifications = async (req, res, next) => {
  try {
    // Retrieve all notifications from the database
    let notifications = await Notification.aggregate([
      {
        $match: {
          $or: [{ createdAt: { $gt: req.user.dateCreated } }],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);
    // get local time
    notifications = convertAllToValidTime(notifications, req, "notifications");
    // Return success response with the retrieved notifications
    res.status(StatusCodes.OK).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    // Handle errors and return appropriate response
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: error.message,
      fullError: error.stack,
    });
  }
};

module.exports = {
  createNotification,
  getAllNotifications,
};
