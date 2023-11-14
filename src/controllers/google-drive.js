const {
  listFiles,
  getFile,
  uploadFile,
  updateFile,
  deleteFile,
} = require("../lib/google-drive");

const handleGoogleDriveAction = (results, actionMessage, response, res) => {
  const { status, data } = results;
  console.log(actionMessage);
  response.success = true;
  response.count = data.files && data.files.length;
  response.data = data;
  res.status(status).send(response);
};

const handleError = (error, action, response, res) => {
  const { status, errors } = error;
  const { message } = (errors && errors[0]) || error;
  console.error(`Error occurred ${action}: [${status}] - ${message}`);
  response.errors = errors || [error];
  res.status(status).send(response);
};

const getFiles = async (req, res, next) => {
  const { query } = req;
  const response = { success: false, query };

  const { q } = query;
  try {
    handleGoogleDriveAction(
      await listFiles(q),
      `Files retrieved using query: ${q}`,
      response,
      res
    );
  } catch (error) {
    handleError(error, "getting files", response, res);
  }
};

const getFileById = async (req, res, next) => {
  const { params } = req;
  const response = { success: false, params };

  const { id } = params;
  try {
    handleGoogleDriveAction(
      await getFile(id),
      `File retrieved: ${id}`,
      response,
      res
    );
  } catch (error) {
    handleError(error, "getting file", response, res);
  }
};

const postFile = async (req, res, next) => {
  const { body } = req;
  const response = { success: false, body };

  const { body: fileBody, name } = body;
  try {
    handleGoogleDriveAction(
      await uploadFile(fileBody, name),
      `File uploaded: ${name}`,
      response,
      res
    );
  } catch (error) {
    handleError(error, "uploading file", response, res);
  }
};

const putFileById = async (req, res, next) => {
  const { params, body } = req;
  const response = { success: false, params, body };

  const { id } = params;
  const { body: fileBody } = body;
  try {
    handleGoogleDriveAction(
      await updateFile(id, fileBody),
      `File updated: ${id}`,
      response,
      res
    );
  } catch (error) {
    handleError(error, "updating file", response, res);
  }
};

const deleteFileById = async (req, res, next) => {
  const { params } = req;
  const response = { success: false, params };

  const { id } = params;
  try {
    handleGoogleDriveAction(
      await deleteFile(id),
      `File deleted: ${id}`,
      response,
      res
    );
  } catch (error) {
    handleError(error, "deleting file", response, res);
  }
};

module.exports = {
  getFiles,
  getFileById,
  postFile,
  putFileById,
  deleteFileById,
};
