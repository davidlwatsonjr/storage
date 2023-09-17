const { google } = require("googleapis");

const pkey = require("../../pk.json");

const SCOPES = ["https://www.googleapis.com/auth/drive.file"];

let googleDriveClient;
const initializeGoogleDriveClient = async () => {
  const googleAPIClient = new google.auth.JWT(
    pkey.client_email,
    null,
    pkey.private_key,
    SCOPES
  );
  await googleAPIClient.authorize();
  googleDriveClient = await google.drive({
    version: "v3",
    auth: googleAPIClient,
  });
  return googleDriveClient;
};

const listFiles = async (q) => {
  googleDriveClient || await initializeGoogleDriveClient();
  return await googleDriveClient.files.list({
    q,
    fields: "nextPageToken, files(id, name)",
  });
};

const getFile = async (fileId) => {
  googleDriveClient || await initializeGoogleDriveClient();
  return await googleDriveClient.files.get({
    fileId,
    alt: "media",
  });
};

const uploadFile = async (body, name) => {
  googleDriveClient || await initializeGoogleDriveClient();
  return await googleDriveClient.files.create({
    media: { body },
    fields: "id",
    requestBody: { name },
  });
};

const updateFile = async (fileId, body) => {
  googleDriveClient || await initializeGoogleDriveClient();
  return await googleDriveClient.files.update({
    media: { body },
    fileId,
  });
};

const deleteFile = async (fileId) => {
  googleDriveClient || await initializeGoogleDriveClient();
  return await googleDriveClient.files.delete({ fileId });
};

module.exports = {
  listFiles,
  getFile,
  uploadFile,
  updateFile,
  deleteFile,
};
