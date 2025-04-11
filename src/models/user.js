const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  gender: { type: String },
  location: { type: String },
});

const User = mongoose.model("user", userSchema, "user");

module.exports = User;
