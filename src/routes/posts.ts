import { Router } from "express";
import passport from "passport";
import {
  createPost,
  deletePost,
  getAllPosts,
  getPost,
  getPostLikes,
  likePost,
} from "../controllers/postController";
import { getUserById, getUserFromParam } from "../controllers/userController";
import { upload, uploadImage } from "../lib/storage";

const router = Router();

// Get all posts for timeline
router.get(
  "/",
  passport.authenticate(["jwt", "anonymous"], { session: false }),
  getAllPosts
);

// Get single post
router.get("/:username/status/:postId", getUserFromParam, getPost);

// Get likes of a single post
router.get("/:username/status/:postId/likes", getPostLikes);

// Create a post
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  upload.single("media"),
  uploadImage,
  createPost
);
router.delete("/:username/status/:postId");

// Like a post
router.patch("/:username/status/:postId/like", getUserById, likePost);

// Delete a post
router.delete(
  "/:username/status/:postId",
  passport.authenticate("jwt", { session: false }),
  deletePost
);

export default router;
