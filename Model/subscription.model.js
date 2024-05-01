const mongoose = require("mongoose");
const subscription = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true,
  },
  currentPackage: { type: Object, required: true },
  packageHistory: [{ type: Object }],
});
const data = mongoose.model("subscription", subscription);
module.exports = data;
