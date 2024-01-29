const {
  listFiles: gcsListFiles,
  getFile: gcsGetFile,
  saveFile: gcsSaveFile,
  deleteFile: gcsDeleteFile,
  deleteFiles: gcsDeleteFiles,
} = require("../lib/google-cloud-storage");

const tryGCSAction = async (results, actionMessage, req, res) => {
  const { params, query, body } = req;
  res.locals.inputs = { params, query, body };
  const data = await results;
  const response = {
    success: true,
    status: 200,
    count: data?.length,
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
    const response = await tryGCSAction(
      gcsListFiles(q),
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
  const { name } = params;
  try {
    const response = await tryGCSAction(
      gcsGetFile(name),
      `File retrieved: ${name}`,
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
  const { body: content, name } = body;
  try {
    const response = await tryGCSAction(
      gcsSaveFile(content, name),
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
  const { name } = params;
  const { body: content } = body;
  try {
    const response = await tryGCSAction(
      gcsSaveFile(content, name),
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
  const { name } = params;
  try {
    const response = await tryGCSAction(
      gcsDeleteFile(name),
      `File deleted: ${name}`,
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
    const error = new Error(
      "You must confirm deletion of all files by setting ?confirm=true",
    );
    error.status = 400;
    next(error);
    return;
  }

  try {
    const response = await tryGoogleDriveAction(
      gcsDeleteFiles("*"),
      "All files deleted",
      req,
      res,
    );
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
