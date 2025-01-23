const express = require("express");
const router = express.Router();

const { validate } = require("../middleware/validationHandler");

const {
  getUserMessages,
  sendMessage,
} = require("../controllers/messagesController");

router.get("/message", validate, getUserMessages);
router.post("/sendMessage", validate, sendMessage);

module.exports = router;
