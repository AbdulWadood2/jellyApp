/* express route */
const express = require("express");
const ROUTE = express.Router();
/* model */
const user = require("../Model/user.model");
/* security */
const {
  createSendToken,
  protect,
  isAdmin,
} = require("../utils/athentication.Controller");
/* controller */
const { getDashboardInfo } = require("../Controller/dashboard.controller");
/* products */
// endpoint /api/v1/dashboard/
// privacy only admin can do it
// method GET
ROUTE.route("/").get(isAdmin, getDashboardInfo);

module.exports = ROUTE;
