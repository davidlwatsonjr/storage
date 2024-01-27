const { google } = require("googleapis");

const pkey = require(process.env.GOOGLE_DRIVE_KEY_FILENAME);

const SCOPES = ["https://www.googleapis.com/auth/drive.file"];
const GOOGLE_DRIVE_UPLOAD_LIMIT = "5mb";

let googleDriveClient;
const initializeGoogleDriveClient = async () => {
  const googleAPIClient = new google.auth.JWT(
    pkey.client_email,
    null,
    pkey.private_key,
    SCOPES
  );
  await googleAPIClient.authorize();
  googleDriveClient = google.drive({
    version: "v3",
    auth: googleAPIClient,
  });
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
    media: { body },
    fields: "id",
    requestBody: { name },
  });
};

const saveFile = async (fileId, body) => {
  googleDriveClient || (await initializeGoogleDriveClient());
  return await googleDriveClient.files.update({
    media: { body },
    fileId,
  });
};

const deleteFile = async (fileId) => {
  googleDriveClient || (await initializeGoogleDriveClient());
  return await googleDriveClient.files.delete({ fileId });
};

module.exports = {
  GOOGLE_DRIVE_UPLOAD_LIMIT,
  listFiles,
  getFile,
  createFile,
  saveFile,
  deleteFile,
};
