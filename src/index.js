const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const path = require("path");

const User = require("./models/user");
const Product = require("./models/products");
const PrimeProduct = require("./models/primeProducts");
const ProductDetails = require("./models/productDetails");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);

app.use(express.json());
const PORT = process.env.PORT || 5001;

const initializeDBandServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDb Atlas Connected");
  } catch (error) {
    console.log("MongoDb Connection Error: ", error);
    process.exit(1);
  }
};

initializeDBandServer();

app.listen(PORT, () => {
  console.log(`Server is Running on http://localhost:${PORT}`);
});

const validatePassword = (password) => {
  return password.length >= 6 && /[A-Z]/.test(password) && /\d/.test(password);
};

const authenticationToken = (request, response, next) => {
  const authHeader = request.headers["authorization"];
  if (!authHeader) {
    return response.status(401).json({ error: "Missing Authorization Header" });
  }

  const jwtToken = authHeader.split(" ")[1];
  if (!jwtToken) {
    return response.status(401).json({ error: "Token Missing" });
  }

  jwt.verify(jwtToken, process.env.JWT_SECRET, (error, payload) => {
    if (error) {
      return response.status(401).json({ error: "Invalid JWT Token" });
    }
    request.user = payload;
    next();
  });
};

//Register New User Api
app.post("/register", async (request, response) => {
  try {
    // console.log("Incoming Request Body:", request.body);
    const { username, name, password, gender, location } = request.body;
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return response.status(400).json({ error: "User Already Exists!" });
    }

    if (!validatePassword(password)) {
      return response.status(400).json({
        error:
          "Password must be at least 6 Charecters long, contain one Uppercase letter and One Number.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      username,
      name,
      password: hashedPassword,
      gender,
      location,
    });

    response.status(201).json({ message: "User Created Successfully" });
  } catch (error) {
    console.error("Error in Registration: ", error);
    response
      .status(500)
      .json({ error: "Something went wrong. Please try again later." });
  }
});

//Login Api
app.post("/login", async (request, response) => {
  try {
    const { username, password } = request.body;
    const user = await User.findOne({ username });

    if (!user) {
      return response.status(401).json({ error: "Invalid User" });
    }

    const isPasswordMatched = await bcrypt.compare(password, user.password);
    if (!isPasswordMatched) {
      return response.status(401).json({ error: "Invalid Password" });
    }

    const payload = { username: user.username, id: user._id };
    const jwtToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    return response.json({ message: "Login Successful", jwtToken });
  } catch (error) {
    console.error("Login Error: ", error);
    return response.status(500).json({ error: "Internal Server Error" });
  }
});

//Get Products Api
app.get("/products", authenticationToken, async (request, response) => {
  try {
    const { sort_by, category, title_search, rating } = request.query;

    let filterOptions = {};

    if (category) {
      const categoryMap = {
        1: "Clothes",
        2: "Electronics",
        3: "Appliances",
        4: "Grocery",
        5: "Toys",
      };
      filterOptions.image_url = {
        $regex: new RegExp(categoryMap[category], "i"),
      };
    }

    if (title_search) {
      filterOptions.title = { $regex: new RegExp(title_search, "i") };
    }

    if (rating) {
      filterOptions.rating = { $gte: rating };
    }

    let sortOptions = {};
    if (sort_by === "PRICE_HIGH") {
      sortOptions.price = -1;
    } else if (sort_by === "PRICE_LOW") {
      sortOptions.price = 1;
    }

    const products = await Product.find(filterOptions).sort(sortOptions);
    response.json(products);
  } catch (error) {
    console.log("Error Fetching Products :", error);
    response.status(500).json({ error: "Internal Server Error" });
  }
});

//Get Prime Deal Products Api
app.get("/prime-deals", authenticationToken, async (request, response) => {
  try {
    const products = await PrimeProduct.find({});
    response.json(products);
  } catch (error) {
    console.log("Error Fetching Products :", error);
    response.status(500).json({ error: "Internal Server Error" });
  }
});

//Get Product Details Api
app.get("/product/:id", authenticationToken, async (request, response) => {
  const { id } = request.params;

  try {
    const product = await ProductDetails.findOne({ id: parseInt(id) });

    if (!product) {
      return response
        .status(404)
        .json({ status_code: 404, error_msg: "Product Not Found" });
    }

    response.status(200).json(product);
  } catch (error) {
    console.error(error);
    response
      .status(500)
      .json({ status_code: 500, error_msg: "Internal Server Error" });
  }
});
