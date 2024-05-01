const express = require("express");
const {
  deleteCategory,
  createCategory,
  getAllCategories,
  updateCategory,
} = require("../Controller/category.controller");
const ROUTE = express.Router();
/* security */
const { isAdmin } = require("../utils/athentication.Controller");
// endPoint /api/v1/category/
// method POST
// @privacy admin only
ROUTE.route("/").post(isAdmin, createCategory);
// endPoint /api/v1/category/
// method GET
// @privacy all can do this
ROUTE.route("/").get(getAllCategories);
// endPoint /api/v1/category/
// method PUT
// @privacy admin only
ROUTE.route("/").put(isAdmin, updateCategory);
// endPoint /api/v1/category/
// method delete
// @privacy admin only
ROUTE.route("/").delete(isAdmin, deleteCategory);

module.exports = ROUTE;
