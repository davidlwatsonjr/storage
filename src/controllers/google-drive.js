const {
  listFiles: gdListFiles,
  getFile: gdGetFile,
  createFile: gdCreateFile,
  saveFile: gdSaveFile,
  deleteFile: gdDeleteFile,
} = require("../lib/google-drive");

const tryGoogleDriveAction = async (results, actionMessage, req, res) => {
  const { params, query, body } = req;
  res.locals.inputs = { params, query, body };
  const { status, data } = await results;
  const response = {
    success: true,
    status,
    count: data?.files?.length,
    data,
    inputs: res.locals.inputs,
  };
  console.log(actionMessage);
  return response;
};

const getFileList = async (req, res, next) => {
  const { query } = req;
  const { q } = query;
  try {
    const response = await tryGoogleDriveAction(
      gdListFiles(q),
      `Files retrieved using query: ${q}`,
      req,
      res,
    );
    res.status(response.status).send(response);
  } catch (err) {
    next(err);
  }
};

const getFile = async (req, res, next) => {
  const { params } = req;
  const { id } = params;
  try {
    const response = await tryGoogleDriveAction(
      gdGetFile(id),
      `File retrieved: ${id}`,
      req,
      res,
    );
    res.status(response.status).send(response);
  } catch (err) {
    next(err);
  }
};

const postFile = async (req, res, next) => {
  const { body } = req;
  const { body: fileBody, name } = body;
  try {
    const response = await tryGoogleDriveAction(
      gdCreateFile(fileBody, name),
      `File uploaded: ${name}`,
      req,
      res,
    );
    res.status(response.status).send(response);
  } catch (err) {
    next(err);
  }
};

const putFile = async (req, res, next) => {
  const { params, body } = req;
  const { id } = params;
  const { body: fileBody } = body;
  try {
    const response = await tryGoogleDriveAction(
      gdSaveFile(id, fileBody),
      `File updated: ${id}`,
      req,
      res,
    );
    res.status(response.status).send(response);
  } catch (err) {
    next(err);
  }
};

const deleteFile = async (req, res, next) => {
  const { params } = req;
  const { id } = params;
  try {
    const response = await tryGoogleDriveAction(
      gdDeleteFile(id),
      `File deleted: ${id}`,
      req,
      res,
    );
    res.status(response.status).send(response);
  } catch (err) {
    next(err);
  }
};

const deleteFiles = async (req, res, next) => {
  const { query } = req;
  const { confirm } = query;
  if (confirm !== "true") {
    const err = new Error(
      "You must confirm deletion of all files by setting ?confirm=true",
    );
    err.status = 400;
    next(err);
    return;
  }

  try {
    const { data } = await gdListFiles();
    console.log(`File list retrieved in preparation for deletion.`);
    const { files } = data;
    const deletionResponses = await Promise.all(
      files.map(async ({ id }) => {
        return await tryGoogleDriveAction(
          gdDeleteFile(id),
          `File deleted: ${id}`,
          req,
          res,
        );
      }),
    );

    const response = {};
    response.success = deletionResponses.every(
      ({ success }) => success === true,
    );
    response.status = deletionResponses.find(
      ({ success }) => success === response.success,
    ).status;
    response.data = deletionResponses;
    response.files = files;

    res.status(response.status).send(response);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getFileList,
  getFile,
  postFile,
  putFile,
  deleteFile,
  deleteFiles,
};
