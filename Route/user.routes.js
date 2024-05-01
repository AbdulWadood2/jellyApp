const express = require("express");
const {
  signUp,
  logIn,
  getUser,
  editUser,
  logout,
  forgetPassword,
  otpCheaker,
  deleteProfileImg,
  getAllUsers,
} = require("../Controller/user.controller");
const ROUTE = express.Router();
/* security */
const {
  createSendToken,
  protect,
  refreshToken,
  isAdmin,
} = require("../utils/athentication.Controller");
/* models */
const User = require("../Model/user.model");
/* user */
// endPoint /api/v1/user/signUp
// method POST
// @privacy user only
ROUTE.route("/signUp").post(signUp);
// endPoint /api/v1/user/logIn
// method POST
// @privacy user only
ROUTE.route("/logIn").post(logIn);
// endPoint /api/v1/user/logout
// method POST
// @privacy user only
ROUTE.route("/logout").post(logout);
// endPoint /api/v1/user/getUser
// method GET
// @privacy user only
ROUTE.route("/getUser").get(protect(User), getUser);
// endPoint /api/v1/user/editUser
// method PUT
// @privacy user only
ROUTE.route("/editUser").put(protect(User), editUser);
// endPoint /api/v1/user/forgetPassword
// method POST
// @privacy user only
ROUTE.route("/forgetPassword").post(forgetPassword);
// endPoint /api/v1/user/otpCheaker
// method POST
// @privacy user only
ROUTE.route("/otpCheaker").post(otpCheaker);
// endPoint /api/v1/user/deleteProfileImg
// method DELETE
// @privacy user only
ROUTE.route("/deleteProfileImg").delete(protect(User), deleteProfileImg);

// post refresh token
// for  public
// endPoint /api/v1/user/refreshToken
// method POST
// @privacy user only
ROUTE.route("/refreshToken").post(refreshToken);
// endPoint /api/v1/user/getAllUsers
// method GET
// @privacy admin only
ROUTE.route("/getAllUsers").get(isAdmin, getAllUsers);

module.exports = ROUTE;
