require("dotenv").config();

const express = require("express");
const {
  listFiles,
  getFile,
  uploadFile,
  updateFile,
  deleteFile,
} = require("./lib/google-drive");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log request
app.use((req, res, next) => {
  console.log(`${req.method} request for '${req.url}'`);
  next();
});

// Authenticate request
const { API_KEY } = process.env;
app.use((req, res, next) => {
  const { headers } = req;

  if (headers["x-api-key"] !== API_KEY) {
    console.warn(`Invalid API key: ${headers["x-api-key"]}`);
    res.status(401).send({ error: "Invalid API key" });
  } else {
    next();
  }
});

app.get("/ping", async (req, res) => {
  res.send("pong");
});

app.get("/files", async (req, res, next) => {
  const { q } = req.query;
  try {
    const { status, data } = await listFiles(q);
    const { files } = data;
    res.status(status).send({ count: files.length, files });
  } catch (err) {
    next(err);
  }
});

app.get("/files/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    const response = await getFile(id);
    const { status, data } = response;
    res.status(status).send(data);
  } catch (err) {
    next(err);
  }
});

app.post("/files", async (req, res, next) => {
  const { body, name } = req.body;
  try {
    const { status, data } = await uploadFile(body, name);
    res.status(status).send(data);
  } catch (err) {
    next(err);
  }
});

app.put("/files/:id", async (req, res, next) => {
  const { id } = req.params;
  const { body } = req.body;
  try {
    const { status, data } = await updateFile(id, body);
    res.status(status).send(data);
  } catch (err) {
    next(err);
  }
});

app.delete("/files/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    const { status, data } = await deleteFile(id);
    res.status(status).send(data);
  } catch (err) {
    next(err);
  }
});

app.use((err, req, res, next) => {
  const { response } = err;
  const { status, data } = response;
  const { error } = data;
  const { message } = error;
  console.error(`${status} - ${message}`);
  res.status(status).send(message);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(
    `The storage app started successfully and is listening for HTTP requests on ${PORT}`
  );
});
