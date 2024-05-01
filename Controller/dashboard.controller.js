const { StatusCodes } = require("http-status-codes");
/* models */
const User = require("../Model/user.model");
const Product = require("../Model/product.model");
const Subscription = require("../Model/subscription.model");
const Package = require("../Model/packages.model");
/* error */
const { customError } = require("../errors/custom.error");
// endpoint /api/v1/dashboard/
// privacy only admin can do it
// method GET
const getDashboardInfo = async (req, res, next) => {
  try {
    const users = await User.find().countDocuments();
    const products = await Product.find().countDocuments();

    const filterPipeline = [
      {
        $match: {
          $or: [
            { "currentPackage.type": "Silver" },
            { "currentPackage.type": "Gold" },
          ],
        },
      },
      {
        $replaceRoot: { newRoot: "$$ROOT" },
      },
    ];

    const subscriptions = await Subscription.aggregate(filterPipeline);
    const package = await Package.countDocuments();

    res.status(StatusCodes.ACCEPTED).json({
      success: true,
      data: {
        users,
        products,
        subscriptions: subscriptions.length,
        totalPackages: package,
      },
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

module.exports = { getDashboardInfo };

// BOTH ARE SAME

// exports.abc= (model) => console.log('BC');

// exports.abc= () => {
//   console.log('BC')
// }
