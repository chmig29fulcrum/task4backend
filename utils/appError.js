class AppError extends Error {
  constructor(message, statusCode) {
    // console.log(message);

    super(message);
    // console.log(message);
    // console.log(statusCode);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    // console.log(this);

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
