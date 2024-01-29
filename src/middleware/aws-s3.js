const awsS3ErrorHandler = (err, req, res, next) => {
  const { $metadata, Code, message, Key } = err;
  if (!$metadata?.httpStatusCode) {
    throw err;
  }
  const { httpStatusCode } = $metadata;
  const { inputs } = res.locals;
  const response = {
    success: false,
    httpStatusCode,
    errors: [err],
    inputs,
  };

  console.error(`AWS S3 ERROR ${httpStatusCode} ${Code}: ${message} (${Key})`);
  res.status(httpStatusCode).send(response);
};

module.exports = { awsS3ErrorHandler };
