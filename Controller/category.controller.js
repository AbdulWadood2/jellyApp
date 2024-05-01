/* errors */
const { StatusCodes } = require("http-status-codes");
const { customError } = require("../errors/custom.error");
/* models */
const Category = require("../Model/category.model");

// endPoint /api/v1/category/
// method POST
// @privacy admin only
const createCategory = async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) {
      return customError(StatusCodes.BAD_REQUEST, res, "Title is required");
    }
    const category = await Category.findOne({ title });
    if (category) {
      return customError(
        StatusCodes.BAD_REQUEST,
        res,
        "this category is already added"
      );
    }
    const newCategory = await Category.create({ title });
    res.status(StatusCodes.CREATED).json({
      success: true,
      data: newCategory,
      error: null,
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
// endPoint /api/v1/category/
// method GET
// @privacy all can do this
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 }); // Sorting categories by dateCreated in descending order
    res.status(StatusCodes.OK).json({
      success: true,
      data: categories,
      error: null,
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
// endPoint /api/v1/category/
// method PUT
// @privacy admin only
const updateCategory = async (req, res) => {
  try {
    const { id } = req.query;
    const { title } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return customError(StatusCodes.NOT_FOUND, res, "Category not found");
    }

    category.title = title || category.title;

    await category.save();

    res.status(StatusCodes.OK).json({
      success: true,
      data: category,
      error: null,
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
// endPoint /api/v1/category/
// method delete
// @privacy admin only
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.query;

    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      return customError(StatusCodes.NOT_FOUND, res, "Category not found");
    }

    res.status(StatusCodes.OK).json({
      success: true,
      data: "category delete successfully",
      error: null,
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

module.exports = {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
};
