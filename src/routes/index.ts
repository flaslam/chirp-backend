import { Router } from "express";
import {
  getAllPosts,
  createPost,
  getPost,
  getUserPosts,
} from "../controllers/postController";
import {
  createUser,
  loginUser,
  getUser,
  returnUser,
} from "../controllers/userController";
import passport from "passport";
import { upload } from "../lib/upload";

const router = Router();

// Post routes
router.get("/", getAllPosts);
router.post("/", passport.authenticate("jwt", { session: false }), createPost);
router.get("/:username/status/:postId", getUser, getPost);
router.delete("/:userId/status/:postId");

// User routes
router.get("/:username", getUser, returnUser);
router.get("/:username/status", getUser, getUserPosts);
router.post("/signup", upload.single("photo"), createUser); // upload.single("photo"),
router.post("/login", loginUser);
router.patch("/:userId/photo");
router.patch("/:userId/profile"); // update name, bio, location, photo, header, birth date, website

export default router;
