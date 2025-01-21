const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const connectToDatabase = require("./config/dataBaseConnect");
const errorHandler = require("./middleware/errorHandler");

const server = express();
const PORT = process.env.PORT || 3000;

connectToDatabase();

server.use(
  express.json(),
  cors({
    origin: process.env.FRONTEND || "*",
  }),
  cookieParser()
);

server.get("/", (req, res) => {
  return res.status(200).json({
    message: "Server is Live",
    DevloperDetails: {
      name: "Aman Vishwakarma",
      age: "23 Years",
      Address: "Mumbai, Maharashtra",
    },
  });
});

server.use(require("./routes/userRoutes"));

server.use(errorHandler);

server.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
