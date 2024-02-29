const awsS3ErrorHandler = (err, req, res, next) => {
  const { $metadata, Code, message, Key } = err;
  if (!$metadata?.httpStatusCode) {
    return next(err);
  }
  const { httpStatusCode: status } = $metadata;
  console.error(`AWS S3 ERROR ${status} ${Code}: ${message} (${Key})`);

  if (res.headersSent) {
    return next(err);
  }
  const response = {
    success: false,
    status,
    errors: [{ message }],
    inputs: res.locals.inputs,
  };
  res.status(status).send(response);
};

module.exports = { awsS3ErrorHandler };
