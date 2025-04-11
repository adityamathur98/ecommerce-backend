const mongoose = require("mongoose");

const productDetailSchema = new mongoose.Schema({
  id: Number,
  image_url: String,
  title: String,
  price: Number,
  description: String,
  brand: String,
  total_reviews: Number,
  rating: Number,
  availability: String,
  similar_products: [
    {
      id: Number,
      image_url: String,
      String,
      title: String,
      style: String,
      price: Number,
      description: String,
      brand: String,
      total_reviews: Number,
      rating: Number,
      availability: String,
    },
  ],
});

const ProductDetails = mongoose.model(
  "ProductDetails",
  productDetailSchema,
  "productDetails"
);

module.exports = ProductDetails;
