const {
  listFiles: s3ListFiles,
  getFile: s3GetFile,
  saveFile: s3SaveFile,
  deleteFile: s3DeleteFile,
  deleteFiles: s3DeleteFiles,
} = require("../lib/aws-s3");

const tryS3Action = async (
  results,
  actionMessage,
  req,
  res,
  dataTransformFn,
) => {
  const { params, query, body } = req;
  res.locals.inputs = { params, query, body };
  const data = await results;
  const transformedData =
    typeof dataTransformFn === "function" ? await dataTransformFn(data) : data;
  const response = {
    success: true,
    status: data?.$metadata?.httpStatusCode,
    count: data?.length,
    data: transformedData,
    inputs: res.locals.inputs,
  };
  console.log(actionMessage);
  return response;
};

const getFileList = async (req, res, next) => {
  const { query } = req;
  const { q } = query;
  try {
    const response = await tryS3Action(
      s3ListFiles(q),
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
    const response = await tryS3Action(
      s3GetFile(name),
      `Files retrieved using query: ${name}`,
      req,
      res,
      async (data) => await data.Body.transformToString(),
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
    const response = await tryS3Action(
      s3SaveFile(name, content),
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
    const response = await tryS3Action(
      s3SaveFile(name, content),
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
  getFileList,
  getFile,
  postFile,
  putFile,
  deleteFile,
  deleteFiles,
};
