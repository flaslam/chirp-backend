import { Request } from "express";

// Uploads
import multer, { FileFilterCallback } from "multer";
const storage = multer.diskStorage({
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

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  // removing null will throw an error
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    // Accept a file
    cb(null, true);
  } else {
    // Reject a file
    cb(null, false);
  }
};

export const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 },
  fileFilter,
});
