const { Storage } = require("@google-cloud/storage");

const { GCS_BUCKET } = process.env;

const storage = new Storage();
const bucket = storage.bucket(GCS_BUCKET);

const listFiles = async (matchGlob) => {
  return (await bucket.getFiles({ matchGlob }))[0];
};

const getFile = async (name) => {
  return (await bucket.file(name).download()).toString();
};

const saveFile = async (data, name) => {
  return await bucket.file(name).save(data);
};

const deleteFile = async (name) => {
  return await bucket.file(name).delete();
};

const deleteFiles = async (matchGlob) => {
  return await bucket.deleteFiles({ matchGlob });
};

module.exports = {
  listFiles,
  getFile,
  saveFile,
  deleteFile,
  deleteFiles,
};
