const googleDriveErrorHandler = (err, req, res, next) => {
  console.log('googleDriveErrorHandler')
  try {
    const { response } = err;
    const { status, data } = response;
    const { error } = data;
    const { message } = error;
    console.error(`${status} - ${message}`);
    res.status(status).send(message);
  } catch {
    throw err;
  }
};

module.exports = { googleDriveErrorHandler };
