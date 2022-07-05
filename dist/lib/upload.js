"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
// Uploads
const multer_1 = __importDefault(require("multer"));
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads/profile/");
    },
    filename: function (req, file, cb) {
        // TODO: change this to id
        const username = req.body.username;
        const extension = file.mimetype.split("/")[1];
        const fileName = username + "." + extension;
        cb(null, fileName);
    },
});
const fileFilter = (req, file, cb) => {
    // removing null will throw an error
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
        // Accept a file
        cb(null, true);
    }
    else {
        // Reject a file
        cb(null, false);
    }
};
exports.upload = (0, multer_1.default)({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 },
    fileFilter,
});
