const {
  listFiles,
  getFile,
  uploadFile,
  updateFile,
  deleteFile,
} = require("../lib/google-drive");

const tryGoogleDriveAction = (results, inputs, actionMessage) => {
  const { status, data } = results;
  const response = {
    success: true,
    status,
    ...inputs,
    count: data.files && data.files.length,
    data,
  };
  console.log(actionMessage);
  return response;
};

const handleError = (error, inputs, action) => {
  const { status, errors } = error;
  const { message } = (errors && errors[0]) || error;
  const response = {
    success: false,
    status,
    ...inputs,
    errors: errors || [error],
  };
  console.error(`Error occurred ${action}: [${status}] - ${message}`);
  return response;
};

const getFiles = async (req, res, next) => {
  const { query } = req;
  const inputs = { query };

  const { q } = query;
  let response;
  try {
    response = tryGoogleDriveAction(
      await listFiles(q),
      inputs,
      `Files retrieved using query: ${q}`
    );
  } catch (error) {
    response = handleError(error, inputs, "getting files");
  }

  res.status(response.status).send(response);
};

const getFileById = async (req, res, next) => {
  const { params } = req;
  const inputs = { params };

  const { id } = params;
  let response;
  try {
    response = tryGoogleDriveAction(
      await getFile(id),
      inputs,
      `File retrieved: ${id}`
    );
  } catch (error) {
    response = handleError(error, inputs, "getting file");
  }

  res.status(response.status).send(response);
};

const postFile = async (req, res, next) => {
  const { body } = req;
  const inputs = { body };

  const { body: fileBody, name } = body;
  let response;
  try {
    response = tryGoogleDriveAction(
      await uploadFile(fileBody, name),
      inputs,
      `File uploaded: ${name}`
    );
  } catch (error) {
    response = handleError(error, inputs, "uploading file");
  }

  res.status(response.status).send(response);
};

const putFileById = async (req, res, next) => {
  const { params, body } = req;
  const inputs = { params, body };

  const { id } = params;
  const { body: fileBody } = body;
  let response;
  try {
    response = tryGoogleDriveAction(
      await updateFile(id, fileBody),
      inputs,
      `File updated: ${id}`
    );
  } catch (error) {
    response = handleError(error, inputs, "updating file");
  }

  res.status(response.status).send(response);
};

const deleteFileById = async (req, res, next) => {
  const { params } = req;
  const inputs = { params };

  const { id } = params;
  let response;
  try {
    response = tryGoogleDriveAction(
      await deleteFile(id),
      inputs,
      `File deleted: ${id}`
    );
  } catch (error) {
    response = handleError(error, inputs, "deleting file");
  }

  res.status(response.status).send(response);
};

const deleteAllFiles = async (req, res, next) => {
  const { query } = req;
  const inputs = { query };

  const { confirm } = query;
  let response;
  try {
    if (confirm !== "true") {
      const error = new Error(
        "You must confirm deletion of all files by setting ?confirm=true"
      );
      error.status = 400;
      throw error;
    }

    const { data } = await listFiles();
    console.log(`File list retrieved in preparation for deletion.`);
    const { files } = data;
    const deletionResponses = await Promise.all(
      files.map(async ({ id }) => {
        const params = { id };
        const inputs = { params };
        return tryGoogleDriveAction(
          await deleteFile(id),
          inputs,
          `File deleted: ${id}`
        );
      })
    );
    response = {};
    response.success = deletionResponses.every(
      ({ success }) => success === true
    );
    response.status = deletionResponses.find(
      ({ success }) => success === response.success
    ).status;
    response.data = deletionResponses;
    response.files = files;
  } catch (error) {
    response = handleError(error, inputs, "deleting all files");
  }

  res.status(response.status).send(response);
};

module.exports = {
  getFiles,
  getFileById,
  postFile,
  putFileById,
  deleteFileById,
  deleteAllFiles,
};
