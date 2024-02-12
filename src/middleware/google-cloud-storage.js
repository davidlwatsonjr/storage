const gcsErrorHandler = (err, req, res, next) => {
  const { error, errors, code, message } = err;
  if (!code) {
    throw err;
  }
  const { inputs } = res.locals;
  const response = {
    success: false,
    code,
    errors: errors || [error],
    message,
    inputs,
  };
  console.error(`GCS ERROR ${code} - ${message}`);
  res.status(code).send(response);
};

module.exports = { gcsErrorHandler };
