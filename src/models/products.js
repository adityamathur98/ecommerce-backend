const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  title: String,
  brand: String,
  price: Number,
  id: Number,
  image_url: String,
  rating: String,
});

const Product = mongoose.model("Product", productSchema, "products");

module.exports = Product;
