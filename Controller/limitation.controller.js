/* status Codes */
const { StatusCodes } = require("http-status-codes");
/* models */
const User = require("../Model/user.model");
const Subscription = require("../Model/subscription.model");
/* error */
const { customError } = require("../errors/custom.error");

/* controllers */
// endpoint /api/v1/limitation/scan
// @privacy only user can do it
// method POST
const scan = async (req, res, next) => {
  try {
    let user = await User.findById(req.user.id);
    const subscription = await Subscription.findOne({ userId: user.id });
    if (subscription.currentPackage.allowedScans <= 0) {
      return customError(
        StatusCodes.FORBIDDEN,
        res,
        "your balanced of allowedScans is zero"
      );
    }
    user.scansDone = user.scansDone + 1;
    await Subscription.updateOne(
      {
        userId: user.id,
      },
      { $inc: { "currentPackage.allowedScans": -1 } }
    );
    await subscription.save();
    await user.save();
    if (user) {
      return res.status(StatusCodes.ACCEPTED).json({
        success: true,
        data: "scan is done",
        error: null,
      });
    } else {
      return customError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        res,
        "error doing scan"
      );
    }
  } catch (error) {
    return customError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      res,
      error.message,
      error.stack
    );
  }
};
// endpoint /api/v1/limitation/aiDescription
// @privacy only user can do it
// method POST
const aiDescription = async (req, res, next) => {
  try {
    let user = await User.findById(req.user.id);
    const subscription = await Subscription.findOne({ userId: user.id });
    if (subscription.currentPackage.aiDescription <= 0) {
      return customError(
        StatusCodes.FORBIDDEN,
        res,
        "your balanced of aiDescription is zero"
      );
    }
    user.aiDescriptionsDone = user.aiDescriptionsDone + 1;
    await Subscription.updateOne(
      {
        userId: user.id,
      },
      { $inc: { "currentPackage.aiDescription": -1 } }
    );
    await subscription.save();
    await user.save();
    if (user) {
      return res.status(StatusCodes.ACCEPTED).json({
        success: true,
        data: "ai Description is done",
        error: null,
      });
    } else {
      return customError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        res,
        "error doing ai Description"
      );
    }
  } catch (error) {
    return customError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      res,
      error.message,
      error.stack
    );
  }
};

module.exports = { scan, aiDescription };
