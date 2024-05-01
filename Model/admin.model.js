const mongoose = require("mongoose");
const adminSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  token: [{ type: String, default: null }],
  image: { type: String, default: null },
  phone_number: { type: String, default: null },
  dateCreated: { type: Date, default: Date.now() },
  dateModified: { type: Date, default: null },
});
const data = mongoose.model("admin", adminSchema);
module.exports = data;
