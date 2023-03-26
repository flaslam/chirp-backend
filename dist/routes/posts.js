"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const passport_1 = __importDefault(require("passport"));
const postController_1 = require("../controllers/postController");
const userController_1 = require("../controllers/userController");
const storage_1 = require("../lib/storage");
const router = (0, express_1.Router)();
// Get all posts for timeline
router.get("/", passport_1.default.authenticate(["jwt", "anonymous"], { session: false }), postController_1.getAllPosts);
// Get single post
router.get("/:username/status/:postId", userController_1.getUserFromParam, postController_1.getPost);
// Get likes of a single post
router.get("/:username/status/:postId/likes", postController_1.getPostLikes);
// Create a post
router.post("/", passport_1.default.authenticate("jwt", { session: false }), storage_1.upload.single("media"), storage_1.uploadImage, postController_1.createPost);
router.delete("/:username/status/:postId");
// Like a post
router.patch("/:username/status/:postId/like", userController_1.getUserById, postController_1.likePost);
// Delete a post
router.delete("/:username/status/:postId", passport_1.default.authenticate("jwt", { session: false }), postController_1.deletePost);
exports.default = router;
