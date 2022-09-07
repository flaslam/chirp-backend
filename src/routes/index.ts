import { Router } from "express";
import {
  getAllPosts,
  createPost,
  getPost,
  getUserPosts,
  likePost,
  deletePost,
  setFilterToIncludeReplies,
  setFilterToLikes,
  setFilterToMedia,
} from "../controllers/postController";
import {
  createUser,
  loginUser,
  getUserFromParam,
  returnUser,
  followUser,
  unfollowUser,
  getUserById,
  updateProfile,
} from "../controllers/userController";
import passport from "passport";
import { upload, uploadImage } from "../lib/storage";

const router = Router();

// POST ROUTES
// Get all posts for timeline
router.get(
  "/",
  passport.authenticate(["jwt", "anonymous"], { session: false }),
  getAllPosts
);

// Create a post
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  upload.single("media"),
  uploadImage,
  createPost
);
router.get("/:username/status/:postId", getUserFromParam, getPost);
router.delete("/:username/status/:postId");

// Like a post
router.patch("/:username/status/:postId/like", getUserById, likePost);

// Delete a post
router.delete(
  "/:username/status/:postId",
  passport.authenticate("jwt", { session: false }),
  deletePost
);

// USER ROUTES
// Return a user object
router.get("/:username/profile", getUserFromParam, returnUser);

// Get all posts from a user
router.get("/:username", getUserFromParam, getUserPosts);

// Get all posts from a user with all replies
router.get(
  "/:username/with_replies",
  getUserFromParam,
  setFilterToIncludeReplies,
  getUserPosts
);

router.get(
  "/:username/media",
  getUserFromParam,
  setFilterToMedia,
  getUserPosts
);

router.get(
  "/:username/likes",
  getUserFromParam,
  setFilterToLikes,
  getUserPosts
);

// Create a new user
router.post("/signup", upload.single("photo"), uploadImage, createUser); // upload.single("photo"),

// Login a user
router.post("/login", loginUser);

// User update profile
router.patch(
  "/:username",
  passport.authenticate("jwt", { session: false }),
  upload.single("photo"),
  uploadImage,
  updateProfile
);

// Follow a user
router.patch("/:username/follow", followUser);

// Unfollow a user
router.patch("/:username/unfollow", unfollowUser);

export default router;
