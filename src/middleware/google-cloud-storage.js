const gcsErrorHandler = (err, req, res, next) => {
  const { error, errors, code: status, message } = err;
  if (!status) {
    return next(err);
  }
  console.error(`GCS ERROR ${status} - ${message}`);

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

module.exports = { gcsErrorHandler };
