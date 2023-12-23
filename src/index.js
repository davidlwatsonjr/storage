require("dotenv").config();

const express = require("express");

const {
  gcpLogTransformer,
  requestLogger,
  authAPIRequest,
  serverErrorHandler,
} = require("@davidlwatsonjr/microservice-middleware");
const { googleDriveErrorHandler } = require("./middleware/google-drive");
const {
  getFiles,
  getFileById,
  postFile,
  putFileById,
  deleteFileById,
  deleteAllFiles,
} = require("./controllers/google-drive");
const {
  getFiles: gcsGetFiles,
  getFileByName: gcsGetFileByName,
  postFile: gcsPostFile,
  putFileByName: gcsPutFileByName,
  deleteFileByName: gcsDeleteFileByName,
  deleteAllFiles: gcsDeleteAllFiles,
} = require("./controllers/google-cloud-storage");
const { GOOGLE_DRIVE_UPLOAD_LIMIT } = require("./lib/google-drive");

const app = express();
app.use(express.json({ limit: GOOGLE_DRIVE_UPLOAD_LIMIT }));
app.use(express.urlencoded({ extended: true }));

app.use(gcpLogTransformer);
app.use(requestLogger);

app.get("/ping", async (req, res) => {
  res.send("pong");
});

app.use(authAPIRequest);

app.get("/files", getFiles);
app.get("/files/:id", getFileById);
app.post("/files", postFile);
app.put("/files/:id", putFileById);
app.delete("/files", deleteAllFiles);
app.delete("/files/:id", deleteFileById);

app.use(googleDriveErrorHandler);

app.get("/gcs/files", gcsGetFiles);
app.get("/gcs/files/:name", gcsGetFileByName);
app.post("/gcs/files", gcsPostFile);
app.put("/gcs/files/:name", gcsPutFileByName);
app.delete("/gcs/files", gcsDeleteAllFiles);
app.delete("/gcs/files/:name", gcsDeleteFileByName);

app.use(serverErrorHandler);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(
    `The storage app started successfully and is listening for HTTP requests on ${PORT}`
  );
});
