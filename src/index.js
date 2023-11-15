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

app.use(serverErrorHandler);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(
    `The storage app started successfully and is listening for HTTP requests on ${PORT}`
  );
});
