class CustomError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.Customerror);
  }
}

class ValidationError extends CustomError {
  constructor(message = "Validation error") {
    super(message, 400);
  }
}

module.exports = { CustomError, ValidationError };
