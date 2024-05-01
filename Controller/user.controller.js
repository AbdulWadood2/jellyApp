const Email = require("../utils/emails");
/* utility functions */
const { deleteFile } = require("../functions/utility.functions");
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
const User = require("../Model/user.model");
const Package = require("../Model/packages.model");
const Subscription = require("../Model/subscription.model");
const Product = require("../Model/product.model");
/* for hashing */
const CryptoJS = require("crypto-js");
/* controllers */
const {
  createSendToken,
  protect,
  isAdmin,
} = require("../utils/athentication.Controller");
/* user */
// endPoint /api/v1/user/signUp
// method POST
// @privacy user only
const signUp = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, fcmKey } = req.body;
    if (!fcmKey) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: "fcmKey is required.",
      });
    }
    // Password encryption (you might want to improve the encryption method)
    let encryptPassword =
      password &&
      CryptoJS.AES.encrypt(password, process.env.CRYPTO_SEC).toString();
    let newUser = await User.create({
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: encryptPassword,
      fcmKey: [fcmKey],
    });
    /* make subscription */
    const package = await Package.findOne({ type: "Freemium" });
    await Subscription.create({
      userId: newUser._id,
      currentPackage: {
        ...package.toObject(),
        subscriptionDate: Date.now(),
      },
    });
    /* for token */
    createSendToken(newUser, 200, req, res, next, fcmKey);
  } catch (error) {
    if (error.code === 11000 && error.keyPattern.email === 1) {
      // Handle the duplicate key error as needed, e.g., send an error response to the client
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ success: false, error: "Email already exists" });
    }
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      error: error.message,
      fullError: error.stack,
    });
  }
};
// endPoint /api/v1/user/logIn
// method POST
// @privacy user only
const logIn = async (req, res, next) => {
  try {
    const { email, password, fcmKey } = req.body;

    if (!email || !password) {
      // Check if both email and password are provided
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: "Both email and password are required.",
      });
    }

    if (!fcmKey) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: "fcmKey is required.",
      });
    }

    const user = await User.findOne({ email });
    if (fcmKey) {
      user.fcmKey.push(fcmKey);
      await user.save();
    }

    if (!user) {
      // Check if the user exists
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        error: "User not found.",
      });
    }

    // Decrypt the password stored in the database and compare it
    const decryptedPassword = CryptoJS.AES.decrypt(
      user.password,
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
    const logIn = user; // Use the user object, as you've already retrieved it

    // You can use your authenticationController to create and send the token
    createSendToken(logIn, 200, req, res, next, fcmKey);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: error.message,
      fullError: error.stack,
    });
  }
};
// endPoint /api/v1/user/getUser
// method GET
// @privacy user only
const getUser = async (req, res, next) => {
  try {
    const { password, token, ...sanitizedUser } = req.user.toObject(); // 'toObject' converts Mongoose document to a plain
    if (sanitizedUser) {
      return res.status(StatusCodes.ACCEPTED).json({
        success: true,
        data: sanitizedUser,
      });
    } else {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        error: "user not found",
      });
    }
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: error.message,
      errorDetail: error.stack,
    });
  }
};
// endPoint /api/v1/user/editUser
// method PUT
// @privacy user only
const editUser = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      oldPassword,
      newPassword,
      phone_number,
      shopifyUrl,
    } = req.body;
    const query = {};
    if (firstName) query.firstName = firstName;
    if (lastName) query.lastName = lastName;
    if (phone_number) query.phone_number = phone_number;
    if (shopifyUrl) query.shopifyUrl = shopifyUrl;
    if (oldPassword && newPassword) {
      let decrypted = CryptoJS.AES.decrypt(
        req.user.password,
        process.env.CRYPTO_SEC
      ).toString(CryptoJS.enc.Utf8);
      if (oldPassword == decrypted) {
        if (newPassword) {
          query.password = CryptoJS.AES.encrypt(
            newPassword,
            process.env.CRYPTO_SEC
          ).toString();
        } else {
          return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            data: null,
            error: "plz provide newPassword",
          });
        }
      } else {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          error: "oldPassword is incorrect",
        });
      }
    }
    const user = await User.findById(req.user.id);
    user.dateModified = Date.now();
    Object.assign(user, query);
    const { password, token, ...sanitizedUser } = user.toObject();
    await user.save();
    if (sanitizedUser) {
      return res.status(StatusCodes.ACCEPTED).json({
        success: true,
        data: sanitizedUser,
      });
    } else {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        error: "user not found",
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
// endPoint /api/v1/user/logout
// method POST
// @privacy user only
const logout = async (req, res, next) => {
  try {
    let token = req.header("Authorization");
    token = token.split(" ");
    token = token[1];
    const authToken = JWT.verify(token, process.env.jwtsecret);
    const user = await User.findOne({ token });
    if (authToken.fcmKey) {
      await User.updateOne({ token }, { $pull: { fcmKey: authToken.fcmKey } });
    }
    if (!user) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: "not user with this token",
      });
    }
    await User.updateOne({ _id: user._id }, { $pull: { token } });
    res.status(StatusCodes.ACCEPTED).json({
      success: true,
      data: "Accepted the user is logout",
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
// endPoint /api/v1/user/forgetPassword
// method POST
// @privacy user only
const forgetPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      function generateSixDigitNumber() {
        const min = 100000; // Smallest 6-digit number
        const max = 999999; // Largest 6-digit number
        return Math.floor(Math.random() * (max - min + 1)) + min;
      }

      const sixDigitNumber = generateSixDigitNumber();
      await new Email(
        { email, name: "" },
        sixDigitNumber
      ).sendVerificationCode();
      let otp = CryptoJS.AES.encrypt(
        `${sixDigitNumber}`,
        process.env.CRYPTO_SEC
      ).toString();
      user.forgetPassword = otp;
      await user.save();
      res.status(StatusCodes.ACCEPTED).json({
        success: true,
        data: { email, otp },
      });
    } else {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        error: "not user with this email",
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
// endPoint /api/v1/user/otpCheaker
// method POST
// @privacy user only
const otpCheaker = async (req, res, next) => {
  try {
    const { email, encryptOpts, otp, newPassword } = req.body;

    const errors = [];

    if (!email) {
      errors.push("Email is required.");
    }

    if (!otp) {
      errors.push("Verification code is required.");
    }

    if (errors.length > 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: errors,
      });
    }

    // Decrypt the encrypted options and compare with the user-entered code
    const decrypted = CryptoJS.AES.decrypt(
      encryptOpts,
      process.env.CRYPTO_SEC
    ).toString(CryptoJS.enc.Utf8);

    if (decrypted !== otp) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        error: "Invalid verification code.",
      });
    }

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        error: "User not found.",
      });
    }
    if (!user.forgetPassword) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        error: "you are not able to change password because of not otp",
      });
    }
    if (encryptOpts != user.forgetPassword) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        error: "generate otp first",
      });
    }
    // Update the user's password
    user.password = CryptoJS.AES.encrypt(
      newPassword,
      process.env.CRYPTO_SEC
    ).toString();
    user.forgetPassword = null;
    await user.save();

    return res.status(StatusCodes.ACCEPTED).json({
      success: true,
      data: "Password reset successfully.",
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: error.message,
      fullError: error.stack,
    });
  }
};
// endPoint /api/v1/user/deleteProfileImg
// method DELETE
// @privacy user only
const deleteProfileImg = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    await deleteFile(user.image);
    if (user.image) {
      user.image = null;
      await user.save().then((user) => {
        res.status(StatusCodes.ACCEPTED).json({
          success: true,
          error: null,
          data: "image is deleted",
        });
      });
    } else {
      customError(StatusCodes.EXPECTATION_FAILED, res, "upload img first");
    }
  } catch (error) {
    customError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      res,
      error.message,
      error.stack
    );
  }
};
// endPoint /api/v1/user/getAllUsers
// method GET
// @privacy admin only
const getAllUsers = async (req, res, next) => {
  try {
    const allUsers = await User.find().select("-password -token");
    res.status(StatusCodes.ACCEPTED).json({
      success: true,
      error: null,
      data: allUsers,
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
  signUp,
  logIn,
  getUser,
  editUser,
  logout,
  forgetPassword,
  otpCheaker,
  deleteProfileImg,
  getAllUsers,
};
