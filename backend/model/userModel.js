const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is Required !"],
    },
    email: {
      type: String,
      required: [true, "Email is Required !"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is Required !"],
      minlength: [8, "Password must be 8 characters long !"],
    },
    profile_Photo: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  try {
    if (this.isModified("password")) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
    next();
  } catch (error) {
    console.error("Error while saving user details", error);
    next(error);
  }
});

const userModel = mongoose.model("user", userSchema);
module.exports = userModel;
