const {
  listFiles: s3ListFiles,
  getFile: s3GetFile,
  saveFile: s3SaveFile,
  deleteFile: s3DeleteFile,
  deleteFiles: s3DeleteFiles,
} = require("../lib/aws-s3");

const tryS3Action = async (results, actionMessage, req, res) => {
  const { params, query, body } = req;
  res.locals.inputs = { params, query, body };
  const data = await results;
  const response = {
    success: true,
    status: data?.$metadata?.httpStatusCode,
    count: data?.length,
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
    const response = await tryS3Action(
      s3ListFiles(q),
      `Files retrieved using query: ${q}`,
      req,
      res,
    );
    response.data = response.data?.Contents || [];
    response.count = response.data.length;
    res.status(200).send(response);
  } catch (err) {
    next(err);
  }
};

const getFile = async (req, res, next) => {
  const { params } = req;
  const { name } = params;
  try {
    const response = await tryS3Action(
      s3GetFile(name),
      `File retrieved: ${name}`,
      req,
      res,
    );
    res.status(200);
    response.data.Body.on("error", next).pipe(res);
  } catch (err) {
    next(err);
  }
};

const postFile = async (req, res, next) => {
  const { body, files } = req;
  const file = files?.file || files?.body;

  const name = body.name || file?.name;
  const data = file?.data || body.file || body.data || body.body;
  const saveOptions = { contentType: file?.mimetype };
  try {
    const response = await tryS3Action(
      s3SaveFile(name, data),
      `File uploaded: ${name}`,
      req,
      res,
    );
    response.data = undefined;
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
    const response = await tryS3Action(
      s3SaveFile(name, content),
      `File updated: ${name}`,
      req,
      res,
    );
    response.data = undefined;
    res.status(response.status).send(response);
  } catch (err) {
    next(err);
  }
};

const deleteFile = async (req, res, next) => {
  const { params } = req;
  const { name } = params;
  try {
    const response = await tryS3Action(
      s3DeleteFile(name),
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
    const response = await tryS3Action(
      s3DeleteFiles(),
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
  getFilesList,
  getFile,
  postFile,
  putFile,
  deleteFile,
  deleteFiles,
};
