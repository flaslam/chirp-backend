"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFile = exports.signUrl = exports.uploadImage = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const client_s3_1 = require("@aws-sdk/client-s3");
const crypto_1 = __importDefault(require("crypto"));
require("dotenv").config();
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
// Multer setup
// Memory storage function
const storage = multer_1.default.memoryStorage(); // store the image in req.file.buffer
const limits = { fileSize: 1024 * 1024 * 5 };
const fileFilter = (req, file, cb) => {
    // removing null will throw an error
    if (file.mimetype === "image/jpeg" ||
        file.mimetype === "image/png" ||
        file.mimetype === "image/gif") {
        // Accept a file
        cb(null, true);
    }
    else {
        // Reject a file
        cb(null, false);
    }
};
// Multer upload function to store images in memory rather than disk
exports.upload = (0, multer_1.default)({
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
const s3Client = new client_s3_1.S3Client(config);
const generateRandomString = (bytes = 32) => crypto_1.default.randomBytes(bytes).toString("hex");
const uploadImage = async (req, res, next) => {
    var _a;
    try {
        if (((_a = req.file) === null || _a === void 0 ? void 0 : _a.buffer) == null) {
            console.log("skipping image upload");
            next();
            return;
        }
        const file = req.file;
        const fileMimetype = file === null || file === void 0 ? void 0 : file.mimetype;
        const fileBuffer = file === null || file === void 0 ? void 0 : file.buffer;
        const imageName = generateRandomString();
        console.log("Uploading image to S3");
        //@ts-ignore
        const data = await uploadFile(fileBuffer, imageName, fileMimetype);
        console.log(data);
        req.body.fileName = imageName;
        next();
    }
    catch (err) {
        console.log(err);
        res.status(401).json(err);
    }
};
exports.uploadImage = uploadImage;
const uploadFile = (fileBuffer, fileName, mimetype) => {
    const uploadParams = {
        Bucket: process.env.BUCKET_NAME,
        Body: fileBuffer,
        Key: fileName,
        ContentType: mimetype,
    };
    return s3Client.send(new client_s3_1.PutObjectCommand(uploadParams));
};
// Handle signing URls
const signUrl = async (imageName) => {
    const params = {
        Bucket: process.env.BUCKET_NAME,
        Key: imageName,
    };
    const command = new client_s3_1.GetObjectCommand(params);
    return await (0, s3_request_presigner_1.getSignedUrl)(s3Client, command, { expiresIn: 3600 });
};
exports.signUrl = signUrl;
// Delete file from S3
const deleteFile = async (path) => {
    const params = {
        Bucket: process.env.BUCKET_NAME,
        Key: path,
    };
    const command = new client_s3_1.DeleteObjectCommand(params);
    return await s3Client.send(command);
};
exports.deleteFile = deleteFile;
