require("dotenv").config();

const express = require("express");
const {
  gcpLogTransformer,
  requestLogger,
  authAPIRequest,
  serverErrorHandler,
  inputsInRes,
} = require("@davidlwatsonjr/microservice-middleware");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(gcpLogTransformer);
app.use(requestLogger);

app.get("/ping", async (req, res) => {
  res.send("pong");
});

app.use(authAPIRequest);
app.use(inputsInRes);

/* Google Cloud Storage */
const gcsControllers = require("./controllers/google-cloud-storage");
const { gcsErrorHandler } = require("./middleware/google-cloud-storage");
app.get("/gcs/files", gcsControllers.getFileList);
app.get("/gcs/files/:name", gcsControllers.getFile);
app.post("/gcs/files", gcsControllers.postFile);
app.put("/gcs/files/:name", gcsControllers.putFile);
app.delete("/gcs/files", gcsControllers.deleteFiles);
app.delete("/gcs/files/:name", gcsControllers.deleteFile);
app.use(gcsErrorHandler);

/* AWS S3 */
const s3Controllers = require("./controllers/aws-s3");
const { awsS3ErrorHandler } = require("./middleware/aws-s3");
app.get("/s3/files", s3Controllers.getFileList);
app.get("/s3/files/:name", s3Controllers.getFile);
app.post("/s3/files", s3Controllers.postFile);
app.put("/s3/files/:name", s3Controllers.putFile);
app.delete("/s3/files", s3Controllers.deleteFiles);
app.delete("/s3/files/:name", s3Controllers.deleteFile);
app.use(awsS3ErrorHandler);

/* Google Drive */
const googleDriveControllers = require("./controllers/google-drive");
const { googleDriveErrorHandler } = require("./middleware/google-drive");
const { GOOGLE_DRIVE_UPLOAD_LIMIT } = require("./lib/google-drive");
app.use(express.json({ limit: GOOGLE_DRIVE_UPLOAD_LIMIT }));
app.get("/files", googleDriveControllers.getFileList);
app.get("/files/:id", googleDriveControllers.getFile);
app.post("/files", googleDriveControllers.postFile);
app.put("/files/:id", googleDriveControllers.putFile);
app.delete("/files", googleDriveControllers.deleteFiles);
app.delete("/files/:id", googleDriveControllers.deleteFile);
app.use(googleDriveErrorHandler);

app.use(serverErrorHandler);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(
    `The storage app started successfully and is listening for HTTP requests on ${PORT}`
  );
});
