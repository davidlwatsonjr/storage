const googleDriveErrorHandler = (err, req, res, next) => {
  const { error, errors, message, status } = err;
  if (!status) {
    return next(err);
  }
  console.error(`Google Drive ERROR ${status} - ${message}`);

  if (res.headersSent) {
    return next(err);
  }
  const response = {
    success: false,
    status,
    errors: (errors?.length && errors) || [error || { message }],
    inputs: res.locals.inputs,
  };
  res.status(status).send(response);
};

module.exports = { googleDriveErrorHandler };
