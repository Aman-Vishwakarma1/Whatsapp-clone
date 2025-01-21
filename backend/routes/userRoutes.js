const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  currentUser,
  logout,
} = require("../controllers/userController");
const { validate } = require("../middleware/validationHandler");

router.post("/signup", registerUser);
router.post("/signin", loginUser);
router.get("/user", validate, currentUser);
router.get("/logout", validate, logout);

module.exports = router;
