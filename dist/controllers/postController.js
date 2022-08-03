"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.likePost = exports.getUserPosts = exports.deletePost = exports.createPost = exports.getPost = exports.getAllPosts = void 0;
const post_1 = __importDefault(require("../models/post"));
const utils_1 = require("../lib/utils");
// Get all posts
const getAllPosts = async (req, res) => {
    try {
        const user = req.user;
        let posts;
        // Default filter to not show any reply posts in the main feed
        let filter = { parent: { $in: [null] } };
        // If we have a user, only show posts from users we follow
        if (user) {
            filter = {
                parent: { $in: [null] },
                $or: [{ user: user.following }, { user: user._id }],
            };
        }
        // Populate user ID with user object and sort in descending order
        posts = await post_1.default.find(filter)
            // .populate("user parent replies reposts likes")
            .populate("user replies reposts likes parent")
            .sort({ date: -1 });
        return res.status(200).json(posts);
    }
    catch (err) {
        if (err instanceof Error) {
            return res.status(500).json({ message: err.message });
        }
        return res.status(500);
    }
};
exports.getAllPosts = getAllPosts;
// Get single post by ID
const getPost = async (req, res, next) => {
    try {
        const post = await post_1.default.findById(req.params.postId)
            .populate("user replies reposts likes parent")
            .populate({
            path: "replies",
            populate: { path: "user parent replies likes reposts" },
        })
            .populate({
            path: "parent",
            populate: { path: "user replies reposts" },
        });
        if (post === null) {
            return res.status(404).json({ message: "Cannot find post." });
        }
        return res.status(200).json({ message: "Found post", post });
    }
    catch (err) {
        if (err instanceof Error) {
            return res.status(500).json({ message: err.message });
        }
        return res.status(500);
    }
};
exports.getPost = getPost;
// Create new post
const createPost = async (req, res) => {
    var _a;
    const user = req.user;
    const post = new post_1.default({
        user: user.id,
        message: req.body.message,
    });
    const parent = req.body.parent;
    if (parent) {
        post.parent = parent;
    }
    console.log(req.file);
    if (req.file) {
        let fileUrl = (_a = req.file) === null || _a === void 0 ? void 0 : _a.path.replace(/\\/g, "/");
        const media = [fileUrl];
        post.media = media;
    }
    try {
        const newPost = await post.save();
        // If this post has a parent (is a reply), add this to the parent Post.
        if (parent) {
            await post_1.default.findByIdAndUpdate(parent, {
                $addToSet: { replies: newPost._id },
            });
        }
        // Populate user to return back to client
        newPost.user = user;
        return res.status(201).json({
            success: true,
            message: "Successfully created new post",
            post: newPost,
        });
    }
    catch (err) {
        if (err instanceof Error) {
            return res.status(400).json({ message: err.message });
        }
        return res.status(400);
    }
};
exports.createPost = createPost;
// TODO: delete post
const deletePost = async (req, res, next) => {
    // const post = await Post.findOne({})
    try {
        // TODO: Check if post ID matches user ID
        const post = await post_1.default.findById(req.params.postId);
        if (!post) {
            return res
                .status(400)
                .json({ success: false, message: "Post could not be found." });
        }
        // await Post.deleteOne(req.params.postId);
        // await Post.findOneAndDelete(req.params.postId);
        // Should remove post from its parent
        // Delete all relevant media
        if (post.media && post.media.length > 0) {
            const pathToFile = String(post.media[0]);
            console.log(pathToFile);
            try {
                (0, utils_1.deleteFile)(pathToFile);
            }
            catch (err) {
                console.log(err);
                // return res
                //   .status(400)
                //   .json({ success: false, message: "Could not delete media" });
            }
        }
        post.delete();
        return res
            .status(200)
            .json({ success: true, message: "Successfully deleted post" });
    }
    catch (err) {
        return res
            .status(400)
            .json({ success: false, message: "Could not delete post.", err: err });
    }
};
exports.deletePost = deletePost;
const getUserPosts = async (req, res, next) => {
    const user = req.user;
    try {
        if (user === undefined) {
            return res.status(404).json({ message: "Cannot find user." });
        }
        // Populate user ID with user object and sort in descending order
        const posts = await post_1.default.find({ user: user.id })
            .populate("user replies reposts likes replies.user parent")
            .sort({
            date: -1,
        });
        return res.status(200).json(posts);
    }
    catch (err) {
        if (err instanceof Error) {
            return res.status(500).json({ message: err.message });
        }
        return res.status(500);
    }
};
exports.getUserPosts = getUserPosts;
// Add user from req to post's likes
const likePost = async (req, res, next) => {
    const user = req.user;
    try {
        if (user === undefined) {
            return res.status(404).json({ message: "Cannot find user." });
        }
        // Like
        if (req.body.like) {
            await post_1.default.findByIdAndUpdate(req.params.postId, {
                $addToSet: { likes: user._id },
            });
            return res.status(200).json({ message: "Added like to post" });
        }
        // Unlike
        if (!req.body.like) {
            await post_1.default.findByIdAndUpdate(req.params.postId, {
                $pull: { likes: user._id },
            });
            return res.status(200).json({ message: "Removed like from post" });
        }
        return res.status(500).json({ message: "Could not process like" });
    }
    catch (err) {
        if (err instanceof Error) {
            return res.status(500).json({ message: err.message });
        }
        return res.status(500);
    }
};
exports.likePost = likePost;
