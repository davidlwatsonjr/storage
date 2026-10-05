const { SECRETS } = process.env;
if (SECRETS) {
  try {
    const secrets = JSON.parse(SECRETS.replace(/\n/g, ""));
    Object.keys(secrets).forEach((key) => {
      process.env[key] = secrets[key];
    });
  } catch (e) {
    console.error("Error parsing SECRETS JSON", e);
  }
}

const express = require("express");
const fileUpload = require("express-fileupload");
const {
  gcpLogTransformer,
  requestLogger,
  authAPIRequest,
  serverErrorHandler,
} = require("@davidlwatsonjr/microservice-middleware");

const app = express();
app.disable("x-powered-by");

const exploitProbePatterns = [
  /\.(?:php\d*|phtml|phar|asp|aspx|ashx|asmx|jsp|jspx|cgi|pl|cfm|cfc)(?:\/|$)/i,
  /(?:^|\/)\.env(?:\.|$)/i,
  /^\/\.git(?:\/|$)/i,
  /^\/\.aws(?:\/|$)/i,
  /(?:^|\/)phpinfo(?:\/|$)/i,
  /^\/wp-(?:admin|content|includes)(?:\/|$)/i,
  /^\/phpmyadmin(?:\/|$)/i,
  /^\/pma(?:\/|$)/i,
  /^\/vendor\/phpunit(?:\/|$)/i,
  /^\/server-status(?:\/|$)/i,
  /^\/actuator(?:\/|$)/i,
  /^\/cgi-bin(?:\/|$)/i,
];

app.use((req, res, next) => {
  // File routes accept arbitrary object names; keep their existing auth checks.
  if (/^\/(?:s3\/|drive\/)?files(?:\/|$)/i.test(req.path)) {
    return next();
  }

  if (!exploitProbePatterns.some((pattern) => pattern.test(req.path))) {
    return next();
  }

  return res
    .status(403)
    .set({
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    })
    .send("Exploit probe, huh?\n\nGood luck. 🖕\n");
});

app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());
app.use(gcpLogTransformer);
app.use(requestLogger);

app.get("/ping", async (req, res) => {
  res.send("pong");
});

app.use(authAPIRequest("STORAGE"));

/* Google Cloud Storage */
const gcsControllers = require("./controllers/google-cloud-storage");
const { gcsErrorHandler } = require("./middleware/google-cloud-storage");
const { GCS_UPLOAD_LIMIT } = require("./lib/google-cloud-storage");
const gcsJsonParser = express.json({ limit: GCS_UPLOAD_LIMIT });
app.get("/files", gcsControllers.getFilesList);
app.get("/files/*", gcsControllers.getFile);
app.post("/files", gcsJsonParser, gcsControllers.postFile);
app.put("/files/*", gcsJsonParser, gcsControllers.putFile);
app.delete("/files", gcsControllers.deleteFiles);
app.delete("/files/*", gcsControllers.deleteFile);
app.use(gcsErrorHandler);

/* AWS S3 */
const s3Controllers = require("./controllers/aws-s3");
const { awsS3ErrorHandler } = require("./middleware/aws-s3");
const { S3_UPLOAD_LIMIT } = require("./lib/aws-s3");
const s3JsonParser = express.json({ limit: S3_UPLOAD_LIMIT });
app.get("/s3/files", s3Controllers.getFilesList);
app.get("/s3/files/*", s3Controllers.getFile);
app.post("/s3/files", s3JsonParser, s3Controllers.postFile);
app.put("/s3/files/*", s3JsonParser, s3Controllers.putFile);
app.delete("/s3/files", s3Controllers.deleteFiles);
app.delete("/s3/files/*", s3Controllers.deleteFile);
app.use(awsS3ErrorHandler);

/* Google Drive */
const gDriveControllers = require("./controllers/google-drive");
const { googleDriveErrorHandler } = require("./middleware/google-drive");
const { GDRIVE_UPLOAD_LIMIT } = require("./lib/google-drive");
const gDriveJsonParser = express.json({ limit: GDRIVE_UPLOAD_LIMIT });
app.get("/drive/files", gDriveControllers.getFilesList);
app.get("/drive/files/*", gDriveControllers.getFile);
app.post("/drive/files", gDriveJsonParser, gDriveControllers.postFile);
app.put("/drive/files/*", gDriveJsonParser, gDriveControllers.putFile);
app.delete("/drive/files", gDriveControllers.deleteFiles);
app.delete("/drive/files/*", gDriveControllers.deleteFile);
app.use(googleDriveErrorHandler);

app.use(serverErrorHandler);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(
    `The storage app started successfully and is listening for HTTP requests on ${PORT}`,
  );
});
