const mongoose = require("mongoose");
const category = new mongoose.Schema(
  {
    title: { type: String, required: true },
  },
  { timestamps: true }
);
const data = mongoose.model("category", category);
module.exports = data;
