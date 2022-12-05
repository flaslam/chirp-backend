import multer, { FileFilterCallback } from "multer";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { RequestHandler } from "express";
import crypto from "crypto";
import { Request } from "express";
require("dotenv").config();

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Multer setup
// Memory storage function
const storage = multer.memoryStorage(); // store the image in req.file.buffer
const limits = { fileSize: 1024 * 1024 * 5 };
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  // removing null will throw an error
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/gif"
  ) {
    // Accept a file
    cb(null, true);
  } else {
    // Reject a file
    cb(null, false);
  }
};

// Multer upload function to store images in memory rather than disk
export const upload = multer({
  storage,
  limits,
  fileFilter,
});

// Configure S3 client
const config = {
  region: process.env.BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
};

const s3Client = new S3Client(config);

const generateRandomString = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");

export const uploadImage: RequestHandler = async (req, res, next) => {
  try {
    if (req.file?.buffer == null) {
      console.log("skipping image upload");
      next();
      return;
    }

    const file = req.file;
    const fileMimetype = file?.mimetype;
    const fileBuffer = file?.buffer;
    const imageName = generateRandomString();

    console.log("Uploading image to S3");
    //@ts-ignore
    const data = await uploadFile(fileBuffer, imageName, fileMimetype);
    console.log(data);
    req.body.fileName = imageName;
    next();
  } catch (err) {
    console.log(err);
    res.status(401).json(err);
  }
};

const uploadFile = (fileBuffer: string, fileName: string, mimetype: string) => {
  const uploadParams = {
    Bucket: process.env.BUCKET_NAME,
    Body: fileBuffer,
    Key: fileName,
    ContentType: mimetype,
  };

  return s3Client.send(new PutObjectCommand(uploadParams));
};

// Handle signing URls
export const signUrl = async (imageName: string): Promise<string> => {
  const params = {
    Bucket: process.env.BUCKET_NAME,
    Key: imageName,
  };

  const command = new GetObjectCommand(params);
  return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
};

// Delete file from S3
export const deleteFile = async (path: string) => {
  const params = {
    Bucket: process.env.BUCKET_NAME,
    Key: path,
  };

  const command = new DeleteObjectCommand(params);
  return await s3Client.send(command);
};
