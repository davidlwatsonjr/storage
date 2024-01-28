const {
  listFiles: s3ListFiles,
  getFile: s3GetFile,
  saveFile: s3SaveFile,
  deleteFile: s3DeleteFile,
  deleteFiles: s3DeleteFiles,
} = require("../lib/aws-s3");

const getFileList = async (req, res) => {
  const { query } = req;
  const inputs = { query };

  const { q } = query;
  const data = await s3ListFiles(q);

  const response = {
    success: true,
    status: data.$metadata.httpStatusCode,
    ...inputs,
    data,
  };

  res.status(response.status).send(response);
};

const getFile = async (req, res) => {
  const { params } = req;
  const inputs = { params };

  const { name } = params;

  const data = await s3GetFile(name);

  const response = {
    success: true,
    status: data.$metadata.httpStatusCode,
    ...inputs,
    data: await data.Body.transformToString(),
  };

  res.status(response.status).send(response);
};

const postFile = async (req, res) => {
  const { body } = req;
  const inputs = { body };

  const { body: content, name } = body;

  const data = await s3SaveFile(name, content);

  const response = {
    success: true,
    status: data.$metadata.httpStatusCode,
    ...inputs,
    data,
  };

  res.status(response.status).send(response);
};

const putFile = async (req, res) => {
  const { params, body } = req;
  const inputs = { params, body };

  const { name } = params;
  const { body: content } = body;

  const data = await s3SaveFile(name, content);

  const response = {
    success: true,
    status: data.$metadata.httpStatusCode,
    ...inputs,
    data,
  };

  res.status(response.status).send(response);
};

const deleteFile = async (req, res) => {
  const { params } = req;
  const inputs = { params };

  const { name } = params;

  const data = await s3DeleteFile(name);

  const response = {
    success: true,
    status: data.$metadata.httpStatusCode,
    ...inputs,
    data,
  };

  res.status(response.status).send(response);
};

const deleteFiles = async (req, res) => {
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

  const inputs = { query };

  const data = await s3DeleteFiles();

  const response = {
    success: true,
    status: data.$metadata.httpStatusCode,
    ...inputs,
    data,
  };

  res.status(response.status).send(response);
};

module.exports = {
  getFileList,
  getFile,
  postFile,
  putFile,
  deleteFile,
  deleteFiles,
};
