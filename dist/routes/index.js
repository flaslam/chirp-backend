"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const postController_1 = require("../controllers/postController");
const userController_1 = require("../controllers/userController");
const passport_1 = __importDefault(require("passport"));
const storage_1 = require("../lib/storage");
const router = (0, express_1.Router)();
// POST ROUTES
// Get all posts for timeline
router.get("/", passport_1.default.authenticate(["jwt", "anonymous"], { session: false }), postController_1.getAllPosts);
// Create a post
router.post("/", passport_1.default.authenticate("jwt", { session: false }), storage_1.upload.single("media"), storage_1.uploadImage, postController_1.createPost);
router.get("/:username/status/:postId", userController_1.getUserFromParam, postController_1.getPost);
router.delete("/:username/status/:postId");
// Like a post
router.patch("/:username/status/:postId/like", userController_1.getUserById, postController_1.likePost);
// Delete a post
router.delete("/:username/status/:postId", passport_1.default.authenticate("jwt", { session: false }), postController_1.deletePost);
// USER ROUTES
// Return a user object
router.get("/:username/profile", userController_1.getUserFromParam, userController_1.returnUser);
// Get all posts from a user
router.get("/:username", userController_1.getUserFromParam, postController_1.getUserPosts);
// Get all posts from a user with all replies
router.get("/:username/with_replies", userController_1.getUserFromParam, postController_1.setFilterToIncludeReplies, postController_1.getUserPosts);
router.get("/:username/media", userController_1.getUserFromParam, postController_1.setFilterToMedia, postController_1.getUserPosts);
router.get("/:username/likes", userController_1.getUserFromParam, postController_1.setFilterToLikes, postController_1.getUserPosts);
// Create a new user
router.post("/signup", storage_1.upload.single("photo"), storage_1.uploadImage, userController_1.createUser); // upload.single("photo"),
// Login a user
router.post("/login", userController_1.loginUser);
// User update profile
router.patch("/:username", passport_1.default.authenticate("jwt", { session: false }), storage_1.upload.single("photo"), storage_1.uploadImage, userController_1.updateProfile);
// Follow a user
router.patch("/:username/follow", userController_1.followUser);
// Unfollow a user
router.patch("/:username/unfollow", userController_1.unfollowUser);
exports.default = router;
