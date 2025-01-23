const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { CustomError } = require("../utils/error");
const userModel = require("../model/userModel");
const cloudinary = require("../config/cloudinaryConnect");

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
    console.log(savedUser);
    return res.status(201).json({
      message: "User registered successfully",
      data: savedUser,
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      return next(new CustomError("Please Login First !", 400));
    }
    const { name, profile_photo } = req.body;

    const updates = {};
    if (name) {
      updates.name = name;
    }
    if (profile_photo) {
      const response = await cloudinary.uploader.upload(profile_photo);
      console.log(response, response.secure_url);
      updates.profile_photo = response.secure_url;
    }

    if (!Object.keys(updates).length) {
      return next(new CustomError("Update any Field first !", 400));
    }

    const updatedUser = await userModel.findOneAndUpdate(
      { _id: user },
      updates,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!updatedUser) {
      return next(
        new CustomError("Something went wrong, Please try again !", 400)
      );
    }
    return res.status(200).json({
      message: "User updated successfully",
      data: { updatedUser },
      success: true,
    });
  } catch (error) {
    return next(new CustomError(error.message));
  }
};

exports.loginUser = async (req, res, next) => {
  try {
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
    const token = jwt.sign({ id: isUser._id }, process.env.JWT_SECRET);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false,
      sameSite: "Strict",
      maxAge: 3600000 * 12,
    });
    return res.status(200).json({ message: "Login Successful", success: true });
  } catch (error) {
    return next(new CustomError(error.message));
  }
};

exports.currentUser = async (req, res, next) => {
  try {
    const userId = req.user;
    const user = await userModel.findById(userId).select("-password");
    return res.json({ user: user, success: true });
  } catch (error) {
    return next(new CustomError(error.message));
  }
};

exports.logoutUser = (req, res, next) => {
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

exports.getAllUser = async (req, res, next) => {
  const currUser = req.user;
  try {
    const allUser = await userModel
      .find({ _id: { $ne: currUser } })
      .select("-password")
      .select("-createdAt")
      .select("-updatedAt")
      .select("-__v");

    if (!allUser) {
      return next(new CustomError("Something Went Wrong !", 500));
    }

    if (allUser.length === 0) {
      return res
        .status(200)
        .json({ message: "No User Found :(", success: true });
    }
    return res
      .status(200)
      .json({ message: "All users", users: allUser, success: true });
  } catch (error) {
    return next(new CustomError(error.message, 400));
  }
};
