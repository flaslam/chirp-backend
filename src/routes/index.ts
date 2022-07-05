import { Router } from "express";
import {
  getAllPosts,
  createPost,
  getPost,
  getUserPosts,
  likePost,
} from "../controllers/postController";
import {
  createUser,
  loginUser,
  getUserFromParam,
  returnUser,
  followUser,
  unfollowUser,
  getUserById,
} from "../controllers/userController";
import passport from "passport";
import { upload } from "../lib/upload";

const router = Router();

// Post routes
// router.get("/", getAllPosts);
router.get(
  "/",
  passport.authenticate(["jwt", "anonymous"], { session: false }),
  getAllPosts
);
router.post("/", passport.authenticate("jwt", { session: false }), createPost);
router.get("/:username/status/:postId", getUserFromParam, getPost);
router.delete("/:username/status/:postId");

// User routes
router.get("/:username", getUserFromParam, returnUser);
router.get("/:username/status", getUserFromParam, getUserPosts);
router.post("/signup", upload.single("photo"), createUser); // upload.single("photo"),
router.post("/login", loginUser);
router.patch("/:username/photo");
router.patch("/:username/profile"); // update name, bio, location, photo, header, birth date, website

// Updates
router.patch("/:username/follow", followUser);
router.patch("/:username/unfollow", unfollowUser);

// Like post
router.patch("/:username/status/:postId/like", getUserById, likePost);

export default router;
