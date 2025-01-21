const jwt = require("jsonwebtoken");
const { CustomError } = require("../utils/error");
const userModel = require("../model/userModel");

exports.validate = async (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) {
    return next(new CustomError("Please Login First", 400));
  }
  try {
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decode);
    const isValidId = await userModel.findById(decode.id);
    if (!isValidId) {
      return next(new CustomError("User does not exists", 400));
    }
    req.user = isValidId._id;
    next();
  } catch (error) {
    return next(new CustomError(error.message, 400));
  }
};
