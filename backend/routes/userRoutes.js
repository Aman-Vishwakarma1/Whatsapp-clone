const express = require("express");
const router = express.Router();

const {
  registerUser,
  updateUser,
  loginUser,
  currentUser,
  logoutUser,
  getAllUser,
} = require("../controllers/userController");
const { validate } = require("../middleware/validationHandler");

router.post("/signup", registerUser);
router.post("/signin", loginUser);
router.get("/user", validate, currentUser);
router.get("/logout", validate, logoutUser);
router.put("/updateProfile", validate, updateUser);
router.get("/getAllUser", validate, getAllUser);

module.exports = router;
