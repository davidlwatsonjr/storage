const {
  listFiles,
  getFile,
  uploadFile,
  deleteFile,
  deleteFiles,
} = require("../lib/google-cloud-storage");

const getFiles = async (req, res) => {
  const { query } = req;
  const inputs = { query };

  const { q } = query;
  const data = await listFiles(q);

  const response = {
    success: true,
    status: 200,
    ...inputs,
    data,
  };

  res.status(response.status).send(response);
};

const getFileByName = async (req, res) => {
  const { params } = req;
  const inputs = { params };

  const { name } = params;

  const data = await getFile(name);

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

  const data = await uploadFile(content, name);

  const response = {
    success: true,
    status: 200,
    ...inputs,
    data,
  };

  res.status(response.status).send(response);
};

const putFileByName = async (req, res) => {
  const { params, body } = req;
  const inputs = { params, body };

  const { name } = params;
  const { body: content } = body;

  const data = await uploadFile(content, name);

  const response = {
    success: true,
    status: 200,
    ...inputs,
    data,
  };

  res.status(response.status).send(response);
};

const deleteFileByName = async (req, res) => {
  const { params } = req;
  const inputs = { params };

  const { name } = params;

  const data = await deleteFile(name);

  const response = {
    success: true,
    status: 200,
    ...inputs,
    data,
  };

  res.status(response.status).send(response);
};

const deleteAllFiles = async (req, res) => {
  const { query } = req;
  const inputs = { query };

  const { confirm } = query;

  const data = confirm === "true" ? await deleteFiles("*") : null;

  const response = {
    success: true,
    status: 200,
    ...inputs,
    data,
  };

  res.status(response.status).send(response);
};

module.exports = {
  getFiles,
  getFileByName,
  postFile,
  putFileByName,
  deleteFileByName,
  deleteAllFiles,
};
