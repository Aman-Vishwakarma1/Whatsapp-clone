const { CustomError } = require("../utils/error");
const userModel = require("../model/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.registerUser = async (req, res, next) => {
  try {
    const { name, email, password, profile_photo } = req.body;
    const error = [];
    if (!name || !email || !password) {
      error.push("Validation Error : Name, Email and Password is Required");
    }
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailRegex.test(email)) {
      error.push("Invalid Email");
    }
    const existingUser = await userModel.findOne({ email: email });
    if (existingUser) {
      error.push("Email Already Registerd");
    }
    if (password.length < 8) {
      error.push("Password must be atleast 8 characters long");
    }

    if (error.length > 0) {
      const err = new CustomError(error[0], 400);
      next(err);
    }

    let payload = {
      name,
      email,
      password,
      profile_photo,
    };

    const newUser = new userModel(payload);
    const savedUser = await newUser.save().catch((error) => {
      return next(error);
    });
    return res.status(201).json({
      message: "User registered successfully",
      data: savedUser,
      status: "success",
    });
  } catch (error) {
    next(error);
  }
};

exports.loginUser = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new CustomError("Email or Password is Missing", 400));
  }
  const isUser = await userModel.findOne({ email: email });
  if (!isUser) {
    return next(new CustomError("User not Found, Signup First", 400));
  }
  const isCorrectPassword = await bcrypt.compare(password, isUser.password);
  if (!isCorrectPassword) {
    return next(new CustomError("Incorrect Password", 400));
  }
  const token = jwt.sign({ id: isUser._id }, process.env.JWT_SCERET);
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" ? true : false,
    sameSite: "Strict",
    maxAge: 3600000 * 12,
  });
  return res
    .status(200)
    .json({ message: "Login Successful", status: "success" });
};

exports.currentUser = async (req, res, next) => {
  try {
    const userId = req.user;
    const user = await userModel.findById(userId).select("-password");
    return res.json(user);
  } catch (error) {
    return next(new CustomError(error.message));
  }
};

exports.logout = (req, res, next) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false,
      sameSite: "Strict",
    });
    return res
      .status(200)
      .json({ message: "Logout Successfull", status: "success" });
  } catch (error) {
    return next(new CustomError(error.message, 400));
  }
};
