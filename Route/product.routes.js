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
  allVerify,
} = require("../utils/athentication.Controller");
/* controller */
const {
  createProduct,
  getUserProducts,
  updateProduct,
  deleteProduct,
  getAllProducts,
  searchProducts,
  uploadProductImg,
  deleteProductImg,
  addStore,
  getAllStores,
  deleteStore,
  editStore,
} = require("../Controller/product.controller");
const { productInTnventory } = require("../Controller/product.controller");
/* products */
// endPoint /api/v1/product/createProduct
// method POST
// @privacy user only
ROUTE.route("/createProduct").post(protect(user), createProduct);
// endPoint /api/v1/product/getUserProducts
// method GET
// @privacy user only
ROUTE.route("/getUserProducts").get(protect(user), getUserProducts);
// endPoint /api/v1/product/deleteProduct
// method DELETE
// @privacy user only
ROUTE.route("/deleteProduct").delete(protect(user), deleteProduct);
// endPoint /api/v1/product/updateProduct
// method PUT
// @privacy user only
ROUTE.route("/updateProduct").put(protect(user), updateProduct);
// endPoint /api/v1/product/getAllProducts
// method GET
// @privacy admin only
ROUTE.route("/getAllProducts").get(isAdmin, getAllProducts);
// endPoint /api/v1/product/searchProducts
// method GET
// @privacy all
ROUTE.route("/searchProducts").get(allVerify, searchProducts);
/* product img */
// endPoint /api/v1/product/uploadProductImg
// method POST
// @privacy user only
ROUTE.route("/uploadProductImg").post(protect(user), uploadProductImg);
// endPoint /api/v1/product/deleteProductImg
// method DELETE
// @privacy user only
ROUTE.route("/deleteProductImg").delete(protect(user), deleteProductImg);
/* store */
// endPoint /api/v1/product/addStores
// method POST
// @privacy user only
ROUTE.route("/addStores").post(protect(user), addStore);
// endPoint /api/v1/product/getAllStores
// method GET
// @privacy user only
ROUTE.route("/getAllStores").get(protect(user), getAllStores);
// endPoint /api/v1/product/deleteStore
// method DELETE
// @privacy user only
ROUTE.route("/deleteStore").delete(protect(user), deleteStore);
// endPoint /api/v1/product/editStore
// method PUT
// @privacy user only
ROUTE.route("/editStore").put(protect(user), editStore);
// endPoint /api/v1/product/productInTnventory
// method get
// @privacy user only
ROUTE.route("/productInTnventory").get(protect(user), productInTnventory);

module.exports = ROUTE;
