const express = require("express");
const {
  setPackage,
  postPackage,
  getAllPackages,
} = require("../Controller/userPlan.controller");
const ROUTE = express.Router();
/* security */
const {
  createSendToken,
  protect,
  refreshToken,
  isAdmin,
  allVerify,
} = require("../utils/athentication.Controller");
/* models */
const User = require("../Model/user.model");
/* user */
// endPoint /api/v1/userPlan/
// method POST
// @privacy user only
ROUTE.route("/").post(protect(User), setPackage);
// endPoint /api/v1/userPlan/
// method POST
// @privacy admin only
ROUTE.route("/").post(isAdmin, postPackage);
// endPoint /api/v1/userPlan/
// method GET
// @privacy all
ROUTE.route("/").get(allVerify, getAllPackages);

module.exports = ROUTE;
