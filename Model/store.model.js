const mongoose = require("mongoose");

const storeSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  name: { type: String, default: null },
  country: { type: String, default: null },
  currency: { type: String, default: null },
  currency_symbol: { type: String, default: null },
  sale_price: { type: String, default: null },
  price: { type: String, default: null },
  link: { type: String, default: null },
  item_group_id: { type: String, default: null },
  availability: { type: String, default: null },
  condition: { type: String, default: null },
  last_update: { type: String, default: null },
  dateCreated: { type: Date, default: null },
  dateModified: { type: Date, default: null },
});

const data = mongoose.model("store", storeSchema);
module.exports = data;
