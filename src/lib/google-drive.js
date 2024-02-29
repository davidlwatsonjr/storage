const { Readable } = require("stream");
const { google } = require("googleapis");

const GDRIVE_UPLOAD_LIMIT = "5MB";

let googleDriveClient;
const initializeGoogleDriveClient = async () => {
  const scopes = ["https://www.googleapis.com/auth/drive.file"];
  const auth = new google.auth.GoogleAuth({ scopes });
  googleDriveClient = google.drive({ version: "v3", auth });
  return googleDriveClient;
};

const listFiles = async (q) => {
  googleDriveClient || (await initializeGoogleDriveClient());
  return await googleDriveClient.files.list({
    q,
    fields: "nextPageToken, files(id, name)",
  });
};

const getFile = async (fileId) => {
  googleDriveClient || (await initializeGoogleDriveClient());
  return await googleDriveClient.files.get({
    fileId,
    alt: "media",
  });
};

const createFile = async (body, name) => {
  googleDriveClient || (await initializeGoogleDriveClient());
  return await googleDriveClient.files.create({
    media: { body: Readable.from(body) },
    requestBody: { name, fields: "id" },
  });
};

const saveFile = async (fileId, body) => {
  googleDriveClient || (await initializeGoogleDriveClient());
  return await googleDriveClient.files.update({
    media: { body: Readable.from(body) },
    fileId,
  });
};

const deleteFile = async (fileId) => {
  googleDriveClient || (await initializeGoogleDriveClient());
  return await googleDriveClient.files.delete({ fileId });
};

module.exports = {
  GDRIVE_UPLOAD_LIMIT,
  listFiles,
  getFile,
  createFile,
  saveFile,
  deleteFile,
};
