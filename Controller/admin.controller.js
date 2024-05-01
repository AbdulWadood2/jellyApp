/* error */
/* jwt */
const JWT = require("jsonwebtoken");
const { customError } = require("../errors/custom.error");
/* status codes */
const {
  ReasonPhrases,
  StatusCodes,
  getReasonPhrase,
  getStatusCode,
} = require("http-status-codes");
/* models */
const Admin = require("../Model/admin.model");
const UserPlan = require("../Model/packages.model");
/* for hashing */
const CryptoJS = require("crypto-js");
/* controllers */
const {
  createSendToken,
  protect,
  isAdmin,
} = require("../utils/athentication.Controller");
// endpoint /api/v1/admin/
// privacy only admin can do it
// method POST
const logIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      // Check if both email and password are provided
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: "Both email and password are required.",
      });
    }

    const admin = await Admin.findOne({ email });

    if (!admin) {
      // Check if the user exists
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        error: "User not found.",
      });
    }

    // Decrypt the password stored in the database and compare it
    const decryptedPassword = CryptoJS.AES.decrypt(
      admin.password,
      process.env.CRYPTO_SEC
    ).toString(CryptoJS.enc.Utf8);

    if (decryptedPassword !== password) {
      // Compare the decrypted password with the provided password
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: "Incorrect password.",
      });
    }

    // If email and password are valid, create and send an authentication token
    const logIn = admin; // Use the user object, as you've already retrieved it

    // You can use your authenticationController to create and send the token
    createSendToken(logIn, 200, req, res);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: error.message,
      fullError: error.stack,
    });
  }
};
// endpoint /api/v1/admin/logout
// privacy only admin can do it
// method POST
const logout = async (req, res, next) => {
  try {
    let token = req.header("Authorization");
    token = token.split(" ");
    token = token[1];
    const admin = await Admin.findOne({ token });
    if (!admin) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: "not admin with this token",
      });
    }
    await Admin.updateOne({ _id: admin._id }, { $pull: { token } });
    res.status(StatusCodes.ACCEPTED).json({
      success: true,
      data: "Accepted the admin is logout",
      error: null,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: error.message,
      error: error.stack,
    });
  }
};

module.exports = {
  logIn,
  logout,
};
