const express = require("express");
const { logIn, logout } = require("../Controller/admin.controller");
const ROUTE = express.Router();
/* security */
const { isAdmin } = require("../utils/athentication.Controller");
/* user */
// endpoint /api/v1/admin/
// privacy only admin can do it
// method POST
ROUTE.route("/").post(logIn);
// endpoint /api/v1/admin/logout
// privacy only admin can do it
// method POST
ROUTE.route("/logout").post(logout);

module.exports = ROUTE;
