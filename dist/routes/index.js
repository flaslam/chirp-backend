"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const postController_1 = require("../controllers/postController");
const userController_1 = require("../controllers/userController");
const passport_1 = __importDefault(require("passport"));
const upload_1 = require("../lib/upload");
const router = (0, express_1.Router)();
// Post routes
// router.get("/", getAllPosts);
router.get("/", passport_1.default.authenticate(["jwt", "anonymous"], { session: false }), postController_1.getAllPosts);
router.post("/", passport_1.default.authenticate("jwt", { session: false }), postController_1.createPost);
router.get("/:username/status/:postId", userController_1.getUserFromParam, postController_1.getPost);
router.delete("/:username/status/:postId");
// User routes
router.get("/:username", userController_1.getUserFromParam, userController_1.returnUser);
router.get("/:username/status", userController_1.getUserFromParam, postController_1.getUserPosts);
router.post("/signup", upload_1.upload.single("photo"), userController_1.createUser); // upload.single("photo"),
router.post("/login", userController_1.loginUser);
// User update profile
router.patch("/:username", passport_1.default.authenticate("jwt", { session: false }), userController_1.updateProfile);
// router.patch("/:username/photo");
// router.patch("/:username/profile"); // update name, bio, location, photo, header, birth date, website
// Updates
router.patch("/:username/follow", userController_1.followUser);
router.patch("/:username/unfollow", userController_1.unfollowUser);
// Like post
router.patch("/:username/status/:postId/like", userController_1.getUserById, postController_1.likePost);
exports.default = router;
