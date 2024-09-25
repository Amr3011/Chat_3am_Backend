// @desc: Custom error class for handling errors in the application
// @params: message, statusCode
// @return: Error object
// @usage: throw new ApiError("Error message", 400);
class ApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
  }
}

module.exports = ApiError;
