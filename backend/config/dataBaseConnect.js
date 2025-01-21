const mongoose = require("mongoose");

const connectDb = async () => {
  await mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
      console.log("Database connected to", mongoose.connection.name);
    })
    .catch((err) => {
      console.error(err.message);
    });
};

module.exports = connectDb;
