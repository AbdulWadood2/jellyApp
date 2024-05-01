const express = require("express");
const { scan, aiDescription } = require("../Controller/limitation.controller");
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
// endpoint /api/v1/limitation/scan
// @privacy only user can do it
// method POST
ROUTE.route("/scan").post(protect(User), scan); // users can do it
// endpoint /api/v1/limitation/aiDescription
// @privacy only user can do it
// method POST
ROUTE.route("/aiDescription").post(protect(User), aiDescription); // users can do it

module.exports = ROUTE;
