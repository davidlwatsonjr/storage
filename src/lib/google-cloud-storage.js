const { Storage } = require("@google-cloud/storage");

const { GCS_BUCKET, GCS_KEY_FILENAME } = process.env;

const storage = new Storage({ keyFilename: GCS_KEY_FILENAME });
const bucket = storage.bucket(GCS_BUCKET);

const listFiles = async () => {
  return (await bucket.getFiles())[0];
};

const getFile = async (name) => {
  return (await bucket.file(name).download()).toString();
};

const uploadFile = async (data, name) => {
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
  uploadFile,
  deleteFile,
  deleteFiles,
};
