const {
  listFiles,
  getFile,
  uploadFile,
  updateFile,
  deleteFile,
} = require("../lib/google-drive");

const tryGoogleDriveAction = (results, actionMessage, response, res) => {
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
    tryGoogleDriveAction(
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
    tryGoogleDriveAction(
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
    tryGoogleDriveAction(
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
    tryGoogleDriveAction(
      await updateFile(id, fileBody),
      `File updated: ${id}`,
      response,
      res
    );
  } catch (error) {
    handleError(error, "updating file", response, res);
  }
};

const deleteAllFiles = async (req, res, next) => {
  const { query } = req;
  const response = { success: false, query };

  const { confirm } = query;
  try {
    if (confirm !== "true") {
      const error = new Error(
        "You must confirm deletion of all files by setting ?confirm=true"
      );
      error.status = 400;
      throw error;
    }

    const { status, data } = await listFiles();
    console.log(`File list retrieved in preparation for deletion.`);
    const { files } = data;
    const deletionResponses = await Promise.all(
      files.map(async ({ id }) => {
        const params = { id };
        const response = { success: false, params };
        const { status, data } = await deleteFile(id);
        console.log(`File deleted: ${id}`);
        response.success = true;
        response.status = status;
        response.data = data;
        return response;
      })
    );
    response.success = deletionResponses.every(
      ({ success }) => success === true
    );
    const deletionsStatus = response.success
      ? status
      : deletionResponses.find(({ success }) => success === false).status;
    response.data = data;
    response.data.deletionResponses = deletionResponses;
    res.status(deletionsStatus).send(response);
  } catch (error) {
    handleError(error, "deleting all files", response, res);
  }
};

const deleteFileById = async (req, res, next) => {
  const { params } = req;
  const response = { success: false, params };

  const { id } = params;
  try {
    tryGoogleDriveAction(
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
  deleteAllFiles,
};
