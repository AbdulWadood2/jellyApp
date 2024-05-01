const mongoose = require("mongoose");

const userPlanSchema = new mongoose.Schema({
  price: { type: Number, required: true },
  allowedScans: { type: Number, required: true },
  aiDescription: { type: Number, required: true },
  type: {
    type: String,
    enum: ["Silver", "Gold", "Freemium"],
    unique: true,
  },
  dateCreated: { type: Date, default: Date.now() },
  dateModified: { type: Date, default: null },
});

const UserLevel = mongoose.model("package", userPlanSchema);

module.exports = UserLevel;
