import { Router } from "express";
import passport from "passport";
import {
  getUserPosts,
  setFilterToIncludeReplies,
  setFilterToLikes,
  setFilterToMedia,
} from "../controllers/postController";
import {
  createUser,
  followUser,
  getUserFromParam,
  loginUser,
  returnUser,
  unfollowUser,
  updateProfile,
} from "../controllers/userController";
import { upload, uploadImage } from "../lib/storage";

const router = Router();

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
