const {
  listFiles: gcsListFiles,
  getFile: gcsGetFile,
  saveFile: gcsSaveFile,
  deleteFile: gcsDeleteFile,
  deleteFiles: gcsDeleteFiles,
} = require("../lib/google-cloud-storage");

const getFileList = async (req, res) => {
  const { query } = req;
  const inputs = { query };

  const { q } = query;
  const data = await gcsListFiles(q);

  const response = {
    success: true,
    status: 200,
    ...inputs,
    data,
  };

  res.status(response.status).send(response);
};

const getFile = async (req, res) => {
  const { params } = req;
  const inputs = { params };

  const { name } = params;

  const data = await gcsGetFile(name);

  const response = {
    success: true,
    status: 200,
    ...inputs,
    data,
  };

  res.status(response.status).send(response);
};

const postFile = async (req, res) => {
  const { body } = req;
  const inputs = { body };

  const { body: content, name } = body;

  const data = await gcsSaveFile(content, name);

  const response = {
    success: true,
    status: 200,
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

  const data = await gcsSaveFile(content, name);

  const response = {
    success: true,
    status: 200,
    ...inputs,
    data,
  };

  res.status(response.status).send(response);
};

const deleteFile = async (req, res) => {
  const { params } = req;
  const inputs = { params };

  const { name } = params;

  const data = await gcsDeleteFile(name);

  const response = {
    success: true,
    status: 200,
    ...inputs,
    data,
  };

  res.status(response.status).send(response);
};

const deleteFiles = async (req, res) => {
  const { query } = req;
  const inputs = { query };

  const { confirm } = query;

  const data = confirm === "true" ? await gcsDeleteFiles("*") : null;

  const response = {
    success: true,
    status: 200,
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
