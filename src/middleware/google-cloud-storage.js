const gcsErrorHandler = (err, req, res, next) => {
  const { error, errors, code, message } = err;
  if (!code) {
    return next(err);
  }
  console.error(`GCS ERROR ${code} - ${message}`);

  const { inputs } = res.locals;
  const response = {
    success: false,
    code,
    errors: errors || [error],
    message,
    inputs,
  };
  res.status(code).send(response);
};

module.exports = { gcsErrorHandler };
