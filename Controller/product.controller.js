const { validationResult } = require("express-validator");
const { StatusCodes } = require("http-status-codes");
/* models */
const Product = require("../Model/product.model");
const Store = require("../Model/store.model");
const Package = require("../Model/packages.model");
const Subscription = require("../Model/subscription.model");
const User = require("../Model/user.model");
/* mongoose */
const mongoose = require("mongoose");
/* error */
const { customError } = require("../errors/custom.error");

/* products */
// endPoint /api/v1/product/createProduct
// method POST
// @privacy user only
const createProduct = async (req, res, next) => {
  try {
    const {
      price,
      quantity,
      sku,
      barcode_number,
      barcode_formats,
      mpn,
      model,
      asin,
      title,
      category,
      manufacturer,
      brand,
      age_group,
      ingredients,
      nutrition_facts,
      energy_efficiency_class,
      color,
      gender,
      material,
      pattern,
      format,
      multipack,
      size,
      length,
      width,
      height,
      weight,
      release_date,
      description,
      last_update,
      images,
      upc,
      condition,
      isfreeshipping,
    } = req.body;
    const productExists = await Product.findOne({
      userId: req.user.id,
      barcode_number,
    });
    if (!productExists) {
      const product = await Product.create({
        userId: req.user.id,
        price,
        quantity,
        sku,
        barcode_number,
        barcode_formats,
        mpn,
        model,
        asin,
        title,
        category,
        manufacturer,
        brand,
        age_group,
        ingredients,
        nutrition_facts,
        energy_efficiency_class,
        color,
        gender,
        material,
        pattern,
        format,
        multipack,
        size,
        length,
        width,
        height,
        weight,
        release_date,
        description,
        last_update,
        images,
        dateCreated: Date(),
        upc,
        condition,
        isfreeshipping,
      });
      res.status(200).json({
        success: true,
        data: product,
      });
    } else {
      res.status(StatusCodes.EXPECTATION_FAILED).json({
        success: false,
        message: "this product already exists",
        product: productExists,
      });
    }
  } catch (error) {
    res.status(404).json({
      success: false,
      error: error.message,
      fullError: error.stack,
    });
  }
};
// endPoint /api/v1/product/getUserProducts
// method GET
// @privacy user only
const getUserProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1; // Get the requested page, default to 1 if not specified
    const perPage = req.query.perPage ? req.query.perPage : 20; // Items per page

    const totalProducts = await Product.countDocuments({ userId: req.user.id });

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set the time to the beginning of the day
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1); // Get the date for tomorrow
    const productsToday = await Product.find({
      userId: req.user.id,
      dateCreated: {
        $gte: today,
        $lt: tomorrow,
      },
    }).sort({ dateCreated: -1 }); // Sort by dateCreated in descending order

    const totalPages = Math.ceil(totalProducts / perPage);

    const skip = (page - 1) * perPage;

    const products = await Product.find({ userId: req.user.id })
      .sort({ dateCreated: -1 }) // Sort by dateCreated in descending order (newest to older)
      .skip(skip)
      .limit(perPage);

    res.status(200).json({
      success: true,
      currentPage: page,
      totalPages,
      perPage: Number(perPage),
      totalItems: totalProducts,
      productsToday: productsToday.length,
      data: products,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: error.message,
      fullError: error.stack,
    });
  }
};
// endPoint /api/v1/product/updateProduct
// method PUT
// @privacy user only
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.query;

    const fieldsToUpdate = [
      "price",
      "quantity",
      "sku",
      "barcode_number",
      "barcode_formats",
      "mpn",
      "model",
      "asin",
      "title",
      "category",
      "manufacturer",
      "brand",
      "age_group",
      "ingredients",
      "nutrition_facts",
      "energy_efficiency_class",
      "color",
      "gender",
      "material",
      "pattern",
      "format",
      "multipack",
      "size",
      "length",
      "width",
      "height",
      "weight",
      "release_date",
      "description",
      "last_update",
      "images",
      "upc",
      "condition",
      "isfreeshipping",
    ];

    const query = {};

    for (const field of fieldsToUpdate) {
      if (req.body[field]) {
        query[field] = req.body[field];
      }
    }
    const updatedUser = await Product.findOne({ _id: id });
    query.dateModified = Date();
    Object.assign(updatedUser, query);
    await updatedUser.save();
    res.status(200).json({
      success: true,
      data: "product is updated",
      updatedUser,
    });
  } catch (error) {
    res.status(200).json({
      success: false,
      error: error.message,
      fullError: error.stack,
    });
  }
};
// endPoint /api/v1/product/deleteProduct
// method DELETE
// @privacy user only
const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.query;
    const deletedProduct = await Product.findById(id);

    if (!deletedProduct) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    // Compare ObjectIds using the `.equals()` method
    if (deletedProduct.userId.equals(req.user._id)) {
      const deletedProductIs = await Product.findByIdAndDelete(id);
      if (deletedProductIs) {
        return res.status(StatusCodes.ACCEPTED).json({
          success: true,
          data: `Product is deleted`,
        });
      } else {
        return res.status(StatusCodes.CONFLICT).json({
          success: false,
          error: "product not deleted",
        });
      }
    } else {
      return res.status(403).json({
        success: false,
        error: "You are not the owner of this product",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      fullError: error.stack,
    });
  }
};
// endPoint /api/v1/product/getAllProducts
// method GET
// @privacy admin only
const getAllProducts = async (req, res, next) => {
  try {
    let { page, perPage } = req.query;

    // Convert to integers and provide default values if not specified
    page = parseInt(page, 10) || 1;
    perPage = parseInt(perPage, 10) || 20;

    const startIndex = (page - 1) * perPage;
    const endIndex = page * perPage;

    const allProducts = await Product.find().skip(startIndex).limit(perPage);

    const totalProductsCount = await Product.countDocuments();

    // Pagination metadata
    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(totalProductsCount / perPage),
      perPage: perPage,
      totalProducts: totalProductsCount,
    };

    return res.status(StatusCodes.ACCEPTED).json({
      success: true,
      error: null,
      data: allProducts,
      pagination: pagination,
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
// endPoint /api/v1/product/searchProducts
// method GET
// @privacy all
const searchProducts = async (req, res, next) => {
  try {
    const { searchQuery } = req.query;

    // Validate that searchQuery is provided
    if (!searchQuery) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: "Search query is required",
      });
    }

    // Search for products based on barcode_number or title starting with the search query
    const searchResults = await Product.find({
      $or: [
        { barcode_number: { $regex: `^${searchQuery}`, $options: "i" } }, // Case-insensitive search
        { title: { $regex: `^${searchQuery}`, $options: "i" } }, // Case-insensitive search
      ],
    });

    res.status(StatusCodes.ACCEPTED).json({
      success: true,
      data:
        searchResults.length > 0
          ? searchResults
          : "no product found from this query",
      error: null,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: error.message,
      fullError: error.stack,
    });
  }
};
/* product images */
// endPoint /api/v1/product/uploadProductImg
// method POST
// @privacy user only
const uploadProductImg = async (req, res, next) => {
  // Check for validation errors using express-validator
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: "Validation errors",
      error: errors.array(),
    });
  }

  try {
    const { productId, images } = req.body;

    // Check if productId and images are provided
    if (!productId || !images) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: "productId and images are required",
      });
    }

    // Check if productId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: "Invalid productId",
      });
    }

    const product = await Product.findOne({ _id: productId });

    if (product) {
      if (product.userId == req.user.id) {
        // You should validate 'images' here to ensure it's a valid format.
        // For example, check if it's an array of image URLs or paths.
        // If you have specific image validation requirements, add them here.

        // Assuming 'images' is an array, you can also check if it's not empty.
        if (!Array.isArray(images) || images.length === 0) {
          return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: "Invalid images format",
          });
        }

        // Assuming 'images' is an array of image URLs or paths, you can add them to the 'product'.
        product.images.push(...images);

        await product.save();

        return res.status(StatusCodes.ACCEPTED).json({
          success: true,
          message: "Images added",
        });
      } else {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          error: "you are not the owner of this product",
        });
      }
    } else {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        error: "Product not found",
      });
    }
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: error.message,
      fullError: error.stack,
    });
  }
};
// endPoint /api/v1/product/deleteProductImg
// method DELETE
// @privacy user only
const deleteProductImg = async (req, res, next) => {
  try {
    const { productId, imgLocattion } = req.query;
    const product = await Product.findOne({ _id: productId });
    if (product && product.userId == req.user.id) {
      if (product.images.includes(imgLocattion)) {
        product.images = product.images.filter((item) => {
          if (item == imgLocattion) {
            return false;
          } else {
            return true;
          }
        });
        await product.save();
        return res.status(StatusCodes.ACCEPTED).send({
          success: true,
          data: "image remove successfully",
        });
      } else {
        return res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          error: "not this image found in this product",
        });
      }
    } else {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        error: "product not found",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      fullError: error.stack,
    });
  }
};

/* product store */
// endPoint /api/v1/product/addStores
// method POST
// @privacy user only
const addStore = async (req, res, next) => {
  try {
    const { productId } = req.query;

    if (Array.isArray(req.body)) {
      // Check if productId is provided and is a valid MongoDB ObjectId
      if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          error: "Invalid productId",
        });
      }

      const storesToCreate = req.body.map((item, index) => {
        const {
          name,
          country,
          currency,
          currency_symbol,
          sale_price,
          price,
          link,
          item_group_id,
          availability,
          condition,
          last_update,
        } = item;

        // Create a store object for each valid item
        return {
          productId,
          name,
          country,
          currency,
          currency_symbol,
          sale_price,
          price,
          link,
          item_group_id,
          availability,
          condition,
          last_update,
          dateCreated: Date(),
        };
      });

      // Create the valid stores in the database
      await Store.insertMany(storesToCreate);

      res.status(StatusCodes.ACCEPTED).json({
        success: true,
        message: "All stores are created",
      });
    } else {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: "Your request should be an array",
      });
    }
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: error.message,
      fullError: error.stack,
    });
  }
};
// endPoint /api/v1/product/getAllStores
// method GET
// @privacy user only
const getAllStores = async (req, res, next) => {
  try {
    const { productId } = req.query;

    // Validate that productId is provided and is a valid MongoDB ObjectId
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: "Invalid productId",
      });
    }

    const stores = await Store.find({ productId }).sort({ dateCreated: -1 }); // Sort by dateCreated in descending order (newest to older);

    res.status(StatusCodes.ACCEPTED).json({
      success: true,
      data: stores,
      error: null,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: error.message,
      data: null,
      fullError: error.stack,
    });
  }
};
// endPoint /api/v1/product/deleteStore
// method DELETE
// @privacy user only
const deleteStore = async (req, res, next) => {
  try {
    const { storeId } = req.query; // Assuming you pass the review ID as a URL parameter

    // Check if reviewId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(storeId)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: "Invalid storeId",
      });
    }

    // Find the review by ID and remove it
    const deletedStore = await Store.findByIdAndRemove(storeId);

    if (deletedStore) {
      return res.status(StatusCodes.OK).json({
        success: true,
        data: "Store deleted successfully",
        deletedStore,
      });
    } else {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        error: "store not found",
      });
    }
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: error.message,
      fullError: error.stack,
    });
  }
};
// endPoint /api/v1/product/editStore
// method PUT
// @privacy user only
const editStore = async (req, res, next) => {
  try {
    const { storeId } = req.query; // Assuming you pass the review ID as a URL parameter
    const {
      name,
      country,
      currency,
      currency_symbol,
      sale_price,
      price,
      link,
      item_group_id,
      availability,
      condition,
      last_update,
    } = req.body;

    // Check if reviewId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(storeId)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: "Invalid storeId",
      });
    }

    // Find the review by ID
    const existingStore = await Store.findById(storeId);

    if (!existingStore) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        error: "Store not found",
      });
    }

    // Check if store_name, store_price, product_url, currency_code, and currency_symbol exist in the request and add them to the updateFields object
    const fields = {
      name,
      country,
      currency,
      currency_symbol,
      sale_price,
      price,
      link,
      item_group_id,
      availability,
      condition,
      last_update,
      dateModified: Date(),
    };
    for (const key in fields) {
      if (fields[key] !== undefined && fields[key] !== null) {
        existingStore[key] = fields[key];
      }
    }
    // Save the updated review
    const updatedStore = await existingStore.save();

    return res.status(StatusCodes.OK).json({
      success: true,
      data: "store updated successfully",
      updatedStore,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: error.message,
      fullError: error.stack,
    });
  }
};
// endPoint /api/v1/product/productInTnventory
// method get
// @privacy user only
const productInTnventory = async (req, res, next) => {
  try {
    const { barcode_number } = req.query;
    if (!barcode_number) {
      return res.status(400).json({
        success: false,
        error: "the barcode_number is required in req.query",
      });
    }
    const product = await Product.findOne({
      userId: req.user.id,
      barcode_number,
    });
    if (product) {
      return res.status(400).json({
        success: false,
        error: "the product is already added",
      });
    }
    return res.status(StatusCodes.OK).json({
      success: true,
      data: "the product is not added",
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: error.message,
      fullError: error.stack,
    });
  }
};

module.exports = {
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
  productInTnventory,
};
