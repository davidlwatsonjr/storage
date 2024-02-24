const {
  listFiles: gcsListFiles,
  getFileStream: gcsGetFileStream,
  saveFile: gcsSaveFile,
  deleteFile: gcsDeleteFile,
  deleteFiles: gcsDeleteFiles,
} = require("../lib/google-cloud-storage");

const tryGCSAction = async (results, actionMessage, req, res) => {
  const { params, query, body } = req;
  // This is done before awaiting the results to ensure that the inputs are saved
  // before the results are awaited. This is important because if there is an error
  // in the results, the inputs can still be used in the output in the error handler.
  res.locals.inputs = { params, query, body };
  const data = await results;
  const response = {
    success: true,
    status: 200,
    count: data?.length,
    data,
    inputs: res.locals.inputs,
  };
  console.log(actionMessage);
  return response;
};

const getFilesList = async (req, res, next) => {
  const { query } = req;
  const { q } = query;
  try {
    const response = await tryGCSAction(
      gcsListFiles(q),
      `Files retrieved using query: ${q}`,
      req,
      res,
    );
    response.data = response.data?.map(({ metadata }) => metadata);
    res.status(200).send(response);
  } catch (err) {
    next(err);
  }
};

const getFile = async (req, res, next) => {
  const { params } = req;
  const { name } = params;
  try {
    const response = await tryGCSAction(
      gcsGetFileStream(name),
      `File retrieved: ${name}`,
      req,
      res,
    );
    response.data.on("error", next).pipe(res);
    res.status(200);
  } catch (err) {
    next(err);
  }
};

const postFile = async (req, res, next) => {
  const { body, files } = req;
  const file = files?.file || files?.body;

  const name = body.name || file?.name;
  const data = file?.data || body.file || body.data || body.body;
  try {
    const response = await tryGCSAction(
      gcsSaveFile(name, data),
      `File uploaded: ${name}`,
      req,
      res,
    );
    res.status(201).send(response);
  } catch (err) {
    next(err);
  }
};

const putFile = async (req, res, next) => {
  const { params, body, files } = req;
  const { name } = params;

  const file = files?.file || files?.body;
  const data = file?.data || body.file || body.data || body.body;
  try {
    const response = await tryGCSAction(
      gcsSaveFile(name, data),
      `File updated: ${name}`,
      req,
      res,
    );
    res.status(200).send(response);
  } catch (err) {
    next(err);
  }
};

const deleteFile = async (req, res, next) => {
  const { params } = req;
  const { name } = params;
  try {
    await tryGCSAction(gcsDeleteFile(name), `File deleted: ${name}`, req, res);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

const deleteFiles = async (req, res, next) => {
  const { query } = req;
  const { confirm } = query;
  if (confirm !== "true") {
    const error = new Error(
      "You must confirm deletion of multiple files by setting ?confirm=true",
    );
    error.status = 400;
    next(error);
    return;
  }

  try {
    const response = await tryGCSAction(
      gcsDeleteFiles("*"),
      "All files deleted",
      req,
      res,
    );
    res.status(204).send(response);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getFilesList,
  getFile,
  postFile,
  putFile,
  deleteFile,
  deleteFiles,
};
