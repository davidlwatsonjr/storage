const googleDriveErrorHandler = (err, req, res, next) => {
  const { error, errors, message, status } = err;
  if (!status) {
    next(err);
  }
  const { inputs } = res.locals;
  const response = {
    success: false,
    status,
    errors: errors || [error],
    message,
    inputs,
  };
  console.error(`Google Drive ERROR ${status} - ${message}`);
  res.status(status).send(response);
};

module.exports = { googleDriveErrorHandler };
