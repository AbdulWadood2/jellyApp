const User = require("../Model/user.model");
const Product = require("../Model/product.model");
const {
  ReasonPhrases,
  StatusCodes,
  getReasonPhrase,
  getStatusCode,
} = require("http-status-codes");
/* error */
const { customError } = require("../errors/custom.error");
/* fs */
const fs = require("fs");
const csv = require("csv-parser");
// endpoint /api/v1/file/addFiles
// method POST
// @privacy only user can do it
const uploadFiles = async (req, res, next) => {
  try {
    const { type } = req.query;
    if (!req.files?.photo && !req.files?.file && !req.files?.video) {
      return customError(
        StatusCodes.BAD_REQUEST,
        res,
        "plz provide img , videos or file"
      );
    }
    let result = {};
    if (req.files.photo) {
      req.files.photo = req.files.photo.map((item) => {
        return `/img/users/${item.filename}`;
      });
      result.photos = req.files.photo;
    }
    if (req.files.video) {
      req.files.video = req.files.video.map((item) => {
        return `/img/users/${item.filename}`;
      });
      result.videos = req.files.video;
    }
    if (req.files.file) {
      req.files.file = req.files.file.map((item) => {
        return `/img/users/${item.filename}`;
      });
      result.files = req.files.file;
    }
    if (type == "users") {
      const user = await User.findOne({ _id: req.user.id });
      if (user) {
        if (user.image) {
          // Delete the file
          try {
            fs.unlink(`./posts/${user.image}`, (err) => {
              if (err) {
                console.log("error deleting the file");
              }
            });
          } catch (error) {
            return customError(
              StatusCodes.INTERNAL_SERVER_ERROR,
              res,
              error.message,
              error.stack
            );
          }
        }
        user.image = req.img;
        await user.save();
        return res.status(200).json({
          success: true,
          data: "user image uploaded",
          error: null,
        });
      } else {
        return res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          error: "user not found",
          data: null,
        });
      }
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
// endpoint /api/v1/file/uploadProductsFromCsv
// method POST
// @privacy only user can do it
const uploadProductsFromCsv = async (req, res) => {
  try {
    // 7. Parse CSV file
    const products = [];
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on("data", (data) => products.push(data))
      .on("end", async () => {
        // Map through products and add userId and dateCreated to each product
        const productsWithUserAndDate = products.map((product) => ({
          ...product,
          userId: req.user.id,
          dateCreated: new Date(),
        }));
        // Insert products into the database
        const productsUploaded = await Product.insertMany(
          productsWithUserAndDate
        );
        return res.status(200).json({
          success: true,
          data: productsUploaded,
          error: null,
        });
      });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  uploadFiles,
  uploadProductsFromCsv,
};
