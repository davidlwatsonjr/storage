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

const getFilesList = async (req, res, next) => {
  const { query } = req;
  const { q } = query;
  try {
    const response = await tryGoogleDriveAction(
      gdListFiles(q),
      `Files retrieved using query: ${q}`,
      req,
      res,
    );
    response.data = response.data?.files || [];
    response.count = response.data.length;
    res.status(200).send(response);
  } catch (err) {
    next(err);
  }
};

const getFile = async (req, res, next) => {
  const { params } = req;
  const id = params[0];
  try {
    const response = await tryGoogleDriveAction(
      gdGetFile(id),
      `File retrieved: ${id}`,
      req,
      res,
    );
    res.status(200).send(response.data);
  } catch (err) {
    next(err);
  }
};

const postFile = async (req, res, next) => {
  const { body, files } = req;
  const file = files?.file || files?.body;

  const name = body.name || file?.name;
  const data = file?.data || body.file || body.data || body.body;
  try {
    const response = await tryGoogleDriveAction(
      gdCreateFile(data, name),
      `File uploaded: ${name}`,
      req,
      res,
    );
    res.status(201).send(response);
  } catch (err) {
    next(err);
  }
};

const putFile = async (req, res, next) => {
  const { params, body, files } = req;
  const id = params[0];

  const file = files?.file || files?.body;
  const data = file?.data || body.file || body.data || body.body;
  try {
    const response = await tryGoogleDriveAction(
      gdSaveFile(id, data),
      `File updated: ${id}`,
      req,
      res,
    );
    res.status(200).send(response);
  } catch (err) {
    next(err);
  }
};

const deleteFile = async (req, res, next) => {
  const { params } = req;
  const id = params[0];
  try {
    const response = await tryGoogleDriveAction(
      gdDeleteFile(id),
      `File deleted: ${id}`,
      req,
      res,
    );
    res.status(204).send(response);
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
    if (!files || files.length === 0) {
      const err = new Error("No files to delete.");
      err.status = 404;
      next(err);
      return;
    }
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

    res.status(204).send(response);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getFilesList,
  getFile,
  postFile,
  putFile,
  deleteFile,
  deleteFiles,
};
