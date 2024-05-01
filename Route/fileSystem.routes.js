const router = require("express").Router();
/* security */
const {
  createSendToken,
  protect,
} = require("../utils/athentication.Controller");
/* import multerFile */
const upload = require("../multer");
/* model */
const User = require("../Model/user.model");
/* controller */
const { uploadFiles, uploadProductsFromCsv } = require("../Controller/fileSystem.controller");
// 3. Set up multer for file upload
const multer = require("multer");
const uploadMulter = multer({ dest: "uploads/" });
/* fileSystem */
// endpoint /api/v1/file/addFiles
// method POST
// @privacy only user can do it
router.post("/addFiles", protect(User), upload, uploadFiles);
/* fileSystem */
// endpoint /api/v1/file/uploadProductsFromCsv
// method POST
// @privacy only user can do it
router.post(
  "/uploadProductsFromCsv",
  protect(User),
  uploadMulter.single("file"),
  uploadProductsFromCsv
);
module.exports = router;
