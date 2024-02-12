const awsS3ErrorHandler = (err, req, res, next) => {
  const { $metadata, Code, message, Key } = err;
  if (!$metadata?.httpStatusCode) {
    next(err);
  }
  const { httpStatusCode } = $metadata;
  const { inputs } = res.locals;
  const response = {
    success: false,
    httpStatusCode,
    errors: [err],
    message,
    inputs,
  };

  console.error(`AWS S3 ERROR ${httpStatusCode} ${Code}: ${message} (${Key})`);
  res.status(httpStatusCode).send(response);
};

module.exports = { awsS3ErrorHandler };
