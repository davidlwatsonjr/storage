const gcsErrorHandler = (err, req, res, next) => {
  console.log("gcsErrorHandler");
  try {
    const { $metadata, Code, message, Key } = err;
    const { httpStatusCode } = $metadata;
    console.error(`[${httpStatusCode}] ${Code}: ${message} (${Key})`);
    res.status(httpStatusCode).send(message);
  } catch {
    throw err;
  }
};

module.exports = { gcsErrorHandler };
