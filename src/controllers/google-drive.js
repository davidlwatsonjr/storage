const {
  listFiles,
  getFile,
  uploadFile,
  updateFile,
  deleteFile,
} = require("../lib/google-drive");

const getFiles = async (req, res, next) => {
  const { q } = req.query;
  const response = { success: false, query: req.query };

  try {
    const { status, data } = await listFiles(q);
    console.log(`Files retrieved using query: ${q}`);
    response.success = true;
    response.count = data.files.length;
    response.data = data;
    res.status(status);
  } catch (error) {
    console.error(
      `Error occurred getting files: [${error.status}] - ${error.errors[0].message}`
    );
    response.errors = error.errors;
    res.status(error.status);
  }

  res.send(response);
};

const getFileById = async (req, res, next) => {
  const { id } = req.params;
  const response = { success: false, id };

  try {
    const { status, data } = await getFile(id);
    console.log(`File retrieved: ${id}`);
    response.success = true;
    response.data = data;
    res.status(status);
  } catch (error) {
    console.error(
      `Error occurred getting file: [${error.status}] - ${error.errors[0].message}`
    );
    response.errors = error.errors;
    res.status(error.status);
  }

  res.send(response);
};

const postFile = async (req, res, next) => {
  const { body, name } = req.body;
  const response = { success: false, name, body };

  try {
    const { status, data } = await uploadFile(body, name);
    console.log(`File uploaded: ${name}`);
    response.success = true;
    response.data = data;
    res.status(status);
  } catch (error) {
    console.error(
      `Error occurred uploading file: [${error.status}] - ${error.errors[0].message}`
    );
    response.errors = error.errors;
    res.status(error.status);
  }

  res.send(response);
};

const putFileById = async (req, res, next) => {
  const { id } = req.params;
  const { body } = req.body;
  const response = { success: false, id, body };

  try {
    const { status, data } = await updateFile(id, body);
    console.log(`File updated: ${id}`);
    response.success = true;
    response.data = data;
    res.status(status);
  } catch (error) {
    console.error(
      `Error occurred updating file: [${error.status}] - ${error.errors[0].message}`
    );
    response.errors = error.errors;
    res.status(error.status);
  }

  res.send(response);
};

const deleteFileById = async (req, res, next) => {
  const { id } = req.params;
  const response = { success: false, id };

  try {
    const { status, data } = await deleteFile(id);
    console.log(`File deleted: ${id}`);
    response.success = true;
    response.data = data;
    res.status(status);
  } catch (error) {
    console.error(
      `Error occurred deleting file: [${error.status}] - ${error.errors[0].message}`
    );
    response.errors = error.errors;
    res.status(error.status);
  }

  res.send(response);
};

module.exports = {
  getFiles,
  getFileById,
  postFile,
  putFileById,
  deleteFileById,
};
