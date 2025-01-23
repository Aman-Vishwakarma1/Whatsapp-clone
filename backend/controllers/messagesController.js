const mongoose = require("mongoose");
const conversationModel = require("../model/conversationModel");
const messageModel = require("../model/messagesModel");
const cloudinary = require("../config/cloudinaryConnect");
const { CustomError } = require("../utils/error");

exports.getUserMessages = async (req, res, next) => {
  try {
    const { id } = req.query;
    receiverId = new mongoose.Types.ObjectId(id);
    const senderId = req.user;

    console.log(senderId, receiverId);
    const conversations = await conversationModel
      .find({
        $or: [
          { sender: senderId, receiver: receiverId },
          { sender: receiverId, receiver: senderId },
        ],
      })
      .populate("messages");
    console.log(conversations);

    return res.status(200).json({
      message: "All user for this conversation",
      data: conversations,
      status: true,
    });
  } catch (error) {
    return next(new CustomError(error.message));
  }
};

exports.sendMessage = async (req, res, next) => {
  try {
    const { id: receiverId } = req.query;
    const senderId = req.user;
    let sendPayload = {};
    let imageUrl;
    let videoUrl;
    const { text, image, video } = req.body;
    if (!text && !image && !video) {
      return next(new CustomError("Provide Input Message first!"), 400);
    }

    if (image) {
      const response = await cloudinary.uploader.upload(image);
      imageUrl = response.secure_url;
      sendPayload["image"] = imageUrl;
    }
    if (video) {
      const response = await cloudinary.uploader.upload(video);
      videoUrl = response.secure_url;
      sendPayload["video"] = videoUrl;
    }
    if (text) {
      sendPayload["text"] = text;
    }
    const newMessage = new messageModel(sendPayload);
    await newMessage.save();

    const getConversation = await conversationModel.findOneAndUpdate(
      { sender: senderId, receiver: receiverId },
      {
        $push: { messages: newMessage._id },
        $setOnInsert: { sender: senderId, receiver: receiverId },
      },
      { new: true, upsert: true }
    );
    if (!getConversation) {
      return next(new CustomError("Error while sending message", 500));
    }
    return res
      .status(200)
      .json({ message: "Message delivered", data: sendPayload, success: true });
  } catch (error) {
    return next(new CustomError(error.message));
  }
};
