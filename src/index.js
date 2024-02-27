require("dotenv").config();

const express = require("express");
const fileUpload = require("express-fileupload");
const {
  gcpLogTransformer,
  requestLogger,
  authAPIRequest,
  serverErrorHandler,
} = require("@davidlwatsonjr/microservice-middleware");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());
app.use(gcpLogTransformer);
app.use(requestLogger);

app.get("/ping", async (req, res) => {
  res.send("pong");
});

app.use(authAPIRequest);

/* Google Cloud Storage */
const gcsControllers = require("./controllers/google-cloud-storage");
const { gcsErrorHandler } = require("./middleware/google-cloud-storage");
app.get("/files", gcsControllers.getFilesList);
app.get("/files/*", gcsControllers.getFile);
app.post("/files", gcsControllers.postFile);
app.put("/files/*", gcsControllers.putFile);
app.delete("/files", gcsControllers.deleteFiles);
app.delete("/files/*", gcsControllers.deleteFile);
app.use(gcsErrorHandler);

/* AWS S3 */
const s3Controllers = require("./controllers/aws-s3");
const { awsS3ErrorHandler } = require("./middleware/aws-s3");
app.get("/s3/files", s3Controllers.getFilesList);
app.get("/s3/files/*", s3Controllers.getFile);
app.post("/s3/files", s3Controllers.postFile);
app.put("/s3/files/*", s3Controllers.putFile);
app.delete("/s3/files", s3Controllers.deleteFiles);
app.delete("/s3/files/*", s3Controllers.deleteFile);
app.use(awsS3ErrorHandler);

/* Google Drive */
const googleDriveControllers = require("./controllers/google-drive");
const { googleDriveErrorHandler } = require("./middleware/google-drive");
const { GOOGLE_DRIVE_UPLOAD_LIMIT } = require("./lib/google-drive");
app.use(express.json({ limit: GOOGLE_DRIVE_UPLOAD_LIMIT }));
app.get("/drive/files", googleDriveControllers.getFilesList);
app.get("/drive/files/*", googleDriveControllers.getFile);
app.post("/drive/files", googleDriveControllers.postFile);
app.put("/drive/files/*", googleDriveControllers.putFile);
app.delete("/drive/files", googleDriveControllers.deleteFiles);
app.delete("/drive/files/*", googleDriveControllers.deleteFile);
app.use(googleDriveErrorHandler);

app.use(serverErrorHandler);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(
    `The storage app started successfully and is listening for HTTP requests on ${PORT}`
  );
});
