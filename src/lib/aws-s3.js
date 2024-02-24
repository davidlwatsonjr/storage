const {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
} = require("@aws-sdk/client-s3");

const Bucket = process.env.S3_BUCKET_NAME;

const s3Client = new S3Client();

const listFiles = async (Prefix) => {
  const command = new ListObjectsV2Command({ Bucket, Prefix });
  return await s3Client.send(command);
};

const getFile = async (Key) => {
  const command = new GetObjectCommand({ Bucket, Key });
  return await s3Client.send(command);
};

const saveFile = async (Key, Body) => {
  const command = new PutObjectCommand({ Bucket, Key, Body });
  return await s3Client.send(command);
};

const deleteFile = async (Key) => {
  const command = new DeleteObjectCommand({ Bucket, Key });
  return await s3Client.send(command);
};

const deleteFiles = async (Prefix) => {
  const { Contents: Objects } = await listFiles(Prefix);
  const command = new DeleteObjectsCommand({ Bucket, Delete: { Objects } });
  return await s3Client.send(command);
};

module.exports = {
  listFiles,
  getFile,
  saveFile,
  deleteFile,
  deleteFiles,
};
