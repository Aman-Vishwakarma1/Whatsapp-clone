const { CustomError } = require("../utils/error");
const userModel = require("../model/userModel");

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

    let newUser = await userModel.create({
      name,
      email,
      password,
      profile_photo,
    });

    res.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
};

exports;
