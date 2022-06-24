import { Request, Router } from "express";
import { getAllPosts, createPost } from "../controllers/postController";
import {
  createUser,
  uploadFile,
  loginUser,
} from "../controllers/userController";

// Uploads
import multer, { FileFilterCallback } from "multer";
// const upload = multer({ dest: "uploads/" });
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/profile/");
  },
  filename: function (req, file, cb) {
    // cb(null, file.originalname);
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
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    // Accept a file
    cb(null, true);
  } else {
    // Reject a file
    cb(null, false);
  }

  // removing null will throw an error
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 },
  fileFilter,
});

const router = Router();

// Post routes
router.get("/", getAllPosts);
router.post("/", createPost);
router.patch("/:id");
router.delete("/:id");

// User routes
router.post("/signup", upload.single("photo"), createUser);
router.post("/login", loginUser);

// Test upload
router.post("/upload", upload.single("photo"), uploadFile);

export default router;
