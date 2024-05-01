const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  token: [{ type: String, default: null }],
  image: { type: String, default: null },
  phone_number: { type: String, default: null },
  dateCreated: { type: Date, default: Date.now() },
  dateModified: { type: Date, default: null },
  scansDone: { type: Number, default: 0 },
  aiDescriptionsDone: { type: Number, default: 0 },
  shopifyUrl: { type: String, default: null },
  forgetPassword: { type: String, default: null },
  fcmKey: [{ type: String }],
});
const data = mongoose.model("user", userSchema);
module.exports = data;
