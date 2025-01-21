const errorHandler = async (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let errorMessage = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    error: {
      errorMessage,
      stack: process.env.NODE_ENV === "production" ? null : err.stack,
    },
  });
};

module.exports = errorHandler;
