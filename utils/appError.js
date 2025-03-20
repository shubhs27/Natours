class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // operational errors

    Error.captureStackTrace(this, this.constructor); // when new obj is created & constructor function is called then that function call is not gonna appear in the stack trace
  }
}

module.exports = AppError;
