/* errors */
const { StatusCodes } = require("http-status-codes");
const { customError } = require("../errors/custom.error");
/* models */
const Package = require("../Model/packages.model");
const Subscription = require("../Model/subscription.model");

/* controllers */
// endPoint /api/v1/userPlan/
// method POST
// @privacy user only
const setPackage = async (req, res) => {
  try {
    const { packageId, transactionId } = req.query;
    const errors = [];
    if (!packageId) {
      errors.push("packageId");
    }
    if (!transactionId) {
      errors.push("transactionId");
    }
    if (errors.length > 0) {
      return customError(
        StatusCodes.BAD_REQUEST,
        res,
        `errors are ${errors.join(" and ")} are required`
      );
    }

    let package = await Package.findById(packageId);
    const subscription = await Subscription.findOne({ userId: req.user.id });
    if (package.type == "Freemium") {
      return customError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        res,
        "this is default package you not able to buy it"
      );
    }
    if (!package) {
      return customError(
        StatusCodes.NOT_FOUND,
        res,
        "this package is not exists"
      );
    }
    let packageForCurrent = package.toObject();
    packageForCurrent.allowedScans =
      packageForCurrent.allowedScans + subscription.currentPackage.allowedScans;
    packageForCurrent.aiDescription =
      packageForCurrent.aiDescription +
      subscription.currentPackage.aiDescription;
    packageForCurrent = {
      ...packageForCurrent,
      transactionId,
      subscriptionDate: Date.now(),
    };

    subscription.packageHistory.push({
      ...subscription.currentPackage,
      subscriptionEnd: Date.now(),
    });
    subscription.currentPackage = packageForCurrent;
    await subscription.save();
    if (subscription) {
      res.status(StatusCodes.ACCEPTED).json({
        success: true,
        data: `user package is now ${package.type}`,
        error: null,
      });
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
// endPoint /api/v1/userPlan/
// method POST
// @privacy admin only
const getAllPackages = async (req, res) => {
  try {
    let packages = await Package.find();
    const subscription = await Subscription.findOne({ userId: req.user.id });
    if ((req.person = "user")) {
      function packageActiveInput(packages) {
        const packagess = [];
        packagess.push({ ...subscription.currentPackage, active: true });
        for (let item of packages) {
          packagess.push({ ...item._doc, active: false });
        }
        return packagess;
      }
      packages = packageActiveInput(packages);
    }
    if (!packages) {
      return customError(StatusCodes.NOT_FOUND, res, "not packages are found");
    }
    res.status(StatusCodes.ACCEPTED).json({
      success: true,
      data: packages,
      error: null,
    });
  } catch (error) {
    return customError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      res,
      error.message,
      error.stack
    );
  }
};
// endPoint /api/v1/userPlan/
// method GET
// @privacy all
const postPackage = async (req, res) => {
  try {
    const { price, allowedScans, aiDescription, type } = req.body;
    const errors = [];
    if (!price) {
      errors.push("price");
    }
    if (!allowedScans) {
      errors.push("allowedScans");
    }
    if (!aiDescription) {
      errors.push("aiDesciption");
    }
    if (!type) {
      errors.push("type");
    }
    if (errors.length > 0) {
      return customError(
        StatusCodes.BAD_REQUEST,
        res,
        `errors are ${errors.join(" and ")}`
      );
    }
    const package = await Package.create({
      price,
      allowedScans,
      aiDescription,
      type,
    });
    if (package) {
      return res.status(StatusCodes.ACCEPTED).json({
        success: true,
        data: package,
        error: null,
      });
    } else {
      return customError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        res,
        "error creating package"
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

module.exports = { setPackage, postPackage, getAllPackages };
