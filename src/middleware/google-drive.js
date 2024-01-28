const googleDriveErrorHandler = (err, req, res, next) => {
  const { error, errors, message, status } = err;
  if (!status) {
    throw err;
  }
  const { inputs } = res.locals;
  const response = {
    success: false,
    status,
    errors: errors || [error],
    inputs,
  };
  console.error(`${status} - ${message}`);
  res.status(status).send(response);
};

module.exports = { googleDriveErrorHandler };
