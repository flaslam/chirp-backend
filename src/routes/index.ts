import { Request, RequestHandler, Router } from "express";
import { getAllPosts, createPost } from "../controllers/postController";
import {
  createUser,
  uploadFile,
  loginUser,
} from "../controllers/userController";
import passport from "passport";

// TODO: move to lib/upload.js
// Uploads
import multer, { FileFilterCallback } from "multer";
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/profile/");
  },
  filename: function (req, file, cb) {
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

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 },
  fileFilter,
});

const router = Router();

// TODO: run this as our own middleware
const authenticateToken: RequestHandler = async (req, res, next) => {
  // This uses our strategy config, returns error or our user at req.user
  passport.authenticate("jwt", { session: false });
  next();
};

// Post routes
router.get("/", getAllPosts);
router.post("/", passport.authenticate("jwt", { session: false }), createPost);
router.patch("/:id");
router.delete("/:id");

// User routes
router.post("/signup", upload.single("photo"), createUser);
router.post("/login", loginUser);

// TODO: separate utils function in lib folder for verifying pw,
// issuing token, and generating pw

// Verification
const verifyToken: RequestHandler = (req, res, next) => {
  // TODO: automate getting the token with ExtractJwt

  // Get auth header value
  const bearerHeader = req.headers["authorization"];

  if (typeof bearerHeader === "undefined") {
    return res
      .status(403)
      .json({ success: false, message: "No authorization token found" });
  }

  // We have the token
  const bearer = bearerHeader.split(" ");

  //
};

// Test upload
router.post("/upload", upload.single("photo"), uploadFile);

const validateUser: RequestHandler = (req, res, next) => {
  console.log(req.user);
  if (req.user) {
    return res
      .status(200)
      .json({ success: true, message: "User authentication is valid" });
  }

  return res
    .status(401)
    .json({ success: false, message: "Session no longer valid" });
};
// Validate user
router.post(
  "/validate",
  passport.authenticate("jwt", { session: false }),
  validateUser
);

export default router;
