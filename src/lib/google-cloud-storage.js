const { Storage } = require("@google-cloud/storage");

const { GCS_BUCKET } = process.env;

const storage = new Storage();
const bucket = storage.bucket(GCS_BUCKET);

const listFiles = async (matchGlob) => {
  return (await bucket.getFiles({ matchGlob }))[0];
};

const getFileMetadata = async (name) => {
  return await bucket.file(name).getMetadata();
};

const getFileStream = (name) => {
  return bucket.file(name).createReadStream();
};

const saveFile = async (data, name, saveOptions) => {
  return await bucket.file(name).save(data, saveOptions);
};

const deleteFile = async (name) => {
  return await bucket.file(name).delete();
};

const deleteFiles = async (matchGlob) => {
  return await bucket.deleteFiles({ matchGlob });
};

module.exports = {
  listFiles,
  getFileMetadata,
  getFileStream,
  saveFile,
  deleteFile,
  deleteFiles,
};
