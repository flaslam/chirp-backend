"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMedia = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
// Uploads
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads/profile/");
    },
    filename: function (req, file, cb) {
        // TODO: change this to id
        // console.log(req.body);
        const username = req.body.username;
        const extension = file.mimetype.split("/")[1];
        const fileName = username + "." + extension;
        cb(null, fileName);
    },
});
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
const FILESIZE_LIMIT_MB = 5;
exports.upload = (0, multer_1.default)({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * FILESIZE_LIMIT_MB },
    fileFilter,
});
const mediaStorage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads/media/");
    },
    filename: function (req, file, cb) {
        //@ts-ignore
        const username = req.user.username;
        // const username = req.body.username;
        const extension = file.mimetype.split("/")[1];
        const fileName = username + "_" + Date.now() + "." + extension;
        cb(null, fileName);
    },
});
exports.uploadMedia = (0, multer_1.default)({
    storage: mediaStorage,
    limits: { fileSize: 1024 * 1024 * FILESIZE_LIMIT_MB },
    fileFilter,
});
// Parse form data
const parseForm = (0, multer_1.default)().any();
