// eslint-disable-next-line no-unused-vars
const globalError = (err, req, res, next) => {
  if (process.env.NODE_ENV === "development") {
    sendErrorInDevelopment(err, res);
  } else {
    sendErrorInProduction(err, res);
  }
};

const sendErrorInDevelopment = (err, res) => {
  const statusCode = err.statusCode || 500;
  const status = err.status || "error";
  res.status(statusCode).json({
    status,
    message: err.message,
    error: err,
    stack: err.stack
  });
};

const sendErrorInProduction = (err, res) => {
  const statusCode = err.statusCode || 500;
  const status = err.status || "error";
  res.status(statusCode).json({
    status,
    message: err.message
  });
};

module.exports = globalError;
