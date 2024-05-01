const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");
const { promisify } = require("util");
/* models */
const User = require("../Model/user.model");
const Admin = require("../Model/admin.model");
/* error */
const { customError } = require("../errors/custom.error");

const signRefreshToken = (uniqueId, fcmKey) => {
  return jwt.sign({ uniqueId, fcmKey }, process.env.jwtsecret);
};

const signToken = (id, uniqueId) => {
  const token = jwt.sign({ id, uniqueId }, process.env.jwtsecret, {
    expiresIn: process.env.expiryTime,
  });
  return `${token}`; // Prepend "Bearer" to the token
};

const createSendToken = async (user, statusCode, req, res, next, fcmKey) => {
  function generateRandomString(length) {
    const characters =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let randomString = "";

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomString += characters.charAt(randomIndex);
    }

    return randomString;
  }
  const randomString = generateRandomString(40);
  // Create refresh Token
  const refreshToken = signRefreshToken(randomString, fcmKey);
  let jwt = signToken(user._id, randomString);
  user.token.push(refreshToken);
  await user.save({ validateBeforeSave: false });
  // user.token = undefined;
  const { password, token, ...sanitizedUser } = user.toObject(); // 'toObject' converts Mongoose document to a plain JavaScript object
  res.status(statusCode).json({
    success: true,
    token: jwt,
    refreshToken,
    data: sanitizedUser,
  });
};

const protect = (model) => async (req, res, next) => {
  try {
    req.img = [];
    let Authorization = req.header("Authorization");
    if (!Authorization) {
      return customError(StatusCodes.BAD_REQUEST, res, "plz provide token");
    }
    Authorization = Authorization.split(" ");
    const payload = jwt.verify(Authorization[1], process.env.jwtsecret);
    const user = await model.findById(payload.id);
    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        error: "unauthorizeged token",
        data: null,
      });
    }
    // const payloadunique = [];
    // for (let item of user.token) {
    //   const token = jwt.verify(item, process.env.jwtsecret);
    //   payloadunique.push(token.uniqueId);
    // }
    // if (!payloadunique.includes(payload.uniqueId)) {
    //   return res.status(500).json({
    //     success: false,
    //     error: "You are not logged in! please login to get access",
    //   });
    // } else {
    const decoded = await promisify(jwt.verify)(
      Authorization[1],
      process.env.jwtsecret
    );
    const freshUser = await model.findById(decoded.id);
    if (!freshUser) {
      return res.status(500).json({
        success: false,
        error: "The user belonging to this token no longer exist!",
      });
    }

    req.user = freshUser;
    next();
  } catch (error) {
    if (error.message == "jwt expired") {
      res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        error: "token expired",
      });
    } else {
      res.status(500).json({
        success: false,
        error: error.message,
        data: null,
      });
    }
  }
};

/* refreshToken */
const refreshToken = async (req, res, next) => {
  try {
    let token = req.header("Authorization");
    if (!token) {
      return customError(StatusCodes.BAD_REQUEST, res, "plz provide token");
    }
    token = token.split(" ");
    token = token[1];
    req.token = token;
    const user = await User.findOne({ token });
    if (!user) {
      throw new Error("User not found or invalid refresh token.");
    }

    // Issue a new access token
    const newAccessToken = signToken(user.id, token[1]);

    res.json({ token: newAccessToken });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: "bad request",
      error: error.message,
      fullError: error.stack,
    });
  }
};

const isAdmin = async (req, res, next) => {
  try {
    let Authorization = req.header("Authorization");
    if (!Authorization) {
      return customError(StatusCodes.BAD_REQUEST, res, "plz provide token");
    }
    Authorization = Authorization.split(" ");
    const payload = jwt.verify(Authorization[1], process.env.jwtsecret);
    const admin = await Admin.findById(payload.id);
    if (admin) {
      req.user = admin;
      next();
    } else {
      return customError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        res,
        "you are not admin (this is only possible by admin)"
      );
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

const allVerify = async (req, res, next) => {
  try {
    let Authorization = req.header("Authorization");
    if (!Authorization) {
      return customError(StatusCodes.BAD_REQUEST, res, "plz provide token");
    }
    Authorization = Authorization.split(" ");
    const payload = jwt.verify(Authorization[1], process.env.jwtsecret);
    const user = await User.findById(payload.id);
    const admin = await Admin.findById(payload.id);
    const person = user ? user : admin;
    if (!person) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        error: "unauthorizeged token",
        data: null,
      });
    }
    // const payloadunique = [];
    // for (let item of person.token) {
    //   const token = jwt.verify(item, process.env.jwtsecret);
    //   payloadunique.push(token.uniqueId);
    // }
    // if (!payloadunique.includes(payload.uniqueId)) {
    //   return res.status(500).json({
    //     success: false,
    //     error: "You are not logged in! please login to get access",
    //   });
    // } else {
    const decoded = await promisify(jwt.verify)(
      Authorization[1],
      process.env.jwtsecret
    );
    const freshUser = await User.findById(decoded.id);
    const freshAdmin = await Admin.findById(decoded.id);
    if (!(freshUser || freshAdmin)) {
      return res.status(500).json({
        success: false,
        error: "The user belonging to this token no longer exist!",
      });
    }
    if (freshUser) {
      req.person = "user";
    } else {
      req.person = "admin";
    }
    req.user = freshUser ? freshUser : freshAdmin;
    next();
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
  createSendToken,
  protect,
  refreshToken,
  isAdmin,
  allVerify,
};

// BOTH ARE SAME

// exports.abc= (model) => console.log('BC');

// exports.abc= () => {
//   console.log('BC')
// }
