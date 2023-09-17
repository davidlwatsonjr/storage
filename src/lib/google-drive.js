const { google } = require("googleapis");

const pkey = require("../../pk.json");

const SCOPES = ["https://www.googleapis.com/auth/drive.file"];

const getGoogleDriveClient = async () => {
  const googleAPIClient = new google.auth.JWT(
    pkey.client_email,
    null,
    pkey.private_key,
    SCOPES
  );
  await googleAPIClient.authorize();
  return google.drive({
    version: "v3",
    auth: googleAPIClient,
  });
};

const listFiles = async (q) => {
  const googleDriveClient = await getGoogleDriveClient();
  return await googleDriveClient.files.list({
    q,
    fields: "nextPageToken, files(id, name)",
  });
};

const getFile = async (fileId) => {
  const googleDriveClient = await getGoogleDriveClient();
  return await googleDriveClient.files.get({
    fileId,
    alt: "media",
  });
};

const uploadFile = async (body, name) => {
  const googleDriveClient = await getGoogleDriveClient();
  return await googleDriveClient.files.create({
    media: { body },
    fields: "id",
    requestBody: { name },
  });
};

const updateFile = async (fileId, body) => {
  const googleDriveClient = await getGoogleDriveClient();
  return await googleDriveClient.files.update({
    media: { body },
    fileId,
  });
};

const deleteFile = async (fileId) => {
  const googleDriveClient = await getGoogleDriveClient();
  return await googleDriveClient.files.delete({ fileId });
};

module.exports = {
  listFiles,
  getFile,
  uploadFile,
  updateFile,
  deleteFile,
};
