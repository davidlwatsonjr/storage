const {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
} = require("@aws-sdk/client-s3");

const bucketName = process.env.S3_BUCKET_NAME;

const s3Client = new S3Client();

const listFiles = async (prefix) => {
  return await s3Client.send(
    new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: prefix,
    }),
  );
};

const getFile = async (key) => {
  return await s3Client.send(
    new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    }),
  );
};

const saveFile = async (key, content) => {
  return await s3Client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: content,
    }),
  );
};

const deleteFile = async (key) => {
  return await s3Client.send(
    new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    }),
  );
};

const deleteFiles = async (prefix) => {
  const objects = await listFiles(prefix);
  const keys = objects.Contents.map((object) => object.Key);
  return await s3Client.send(
    new DeleteObjectsCommand({
      Bucket: bucketName,
      Delete: {
        Objects: keys,
      },
    }),
  );
};

module.exports = {
  listFiles,
  getFile,
  saveFile,
  deleteFile,
  deleteFiles,
};
