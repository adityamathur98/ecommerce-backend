const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  id: Number,
  image_url: String,
  title: String,
  style: String,
  price: Number,
  description: String,
  brand: String,
  total_reviews: Number,
  rating: Number,
  availability: String,
});

const PrimeProduct = mongoose.model(
  "PrimeProduct",
  productSchema,
  "primeDeals"
);

module.exports = PrimeProduct;
