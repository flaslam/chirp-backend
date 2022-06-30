import Post from "../models/post";
import { RequestHandler } from "express";

// Get all posts
export const getAllPosts: RequestHandler = async (req, res) => {
  try {
    // Populate user ID with user object and sort in descending order
    // TODO: maybe don't need to populate replies/likes/reposts other than count until details expand
    const posts = await Post.find().populate("user").sort({ date: -1 });
    return res.status(200).json(posts);
  } catch (err: unknown) {
    if (err instanceof Error) {
      return res.status(500).json({ message: err.message });
    }
    return res.status(500);
  }
};

// Get single post by ID
export const getPost: RequestHandler = async (req, res, next) => {
  let post;
  try {
    const post = await Post.findById(req.params.postId).populate("user");
    if (post === null) {
      return res.status(404).json({ message: "Cannot find post." });
    }

    const children = await Post.find({ parent: req.params.postId }).populate(
      "user"
    );

    // This saves us having to populate the user field again as we have this info stored
    // post.user = req.user;

    return res.status(200).json({ message: "Found post", post, children });
  } catch (err: unknown) {
    if (err instanceof Error) {
      return res.status(500).json({ message: err.message });
    }
    return res.status(500);
  }
};

// Create new post
export const createPost: RequestHandler = async (req, res) => {
  const user: any = req.user;
  console.log(req.body);
  const post = new Post({
    user: user.id,
    message: req.body.message,
    parent: req.body.parent,
  });
  try {
    const newPost = await post.save();

    newPost.user = user;
    return res.status(201).json({
      success: true,
      message: "Successfully created new post",
      post: newPost,
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      return res.status(400).json({ message: err.message });
    }
    return res.status(400);
  }
};

// TODO: delete post
export const deletePost: RequestHandler = async (req, res, next) => {
  // const post = await Post.findOne({})
};

export const getUserPosts: RequestHandler = async (req, res, next) => {
  const user: any = req.user;
  try {
    if (user === undefined) {
      return res.status(404).json({ message: "Cannot find user." });
    }

    // Populate user ID with user object and sort in descending order
    const posts = await Post.find({ user: user.id }).populate("user").sort({
      date: -1,
    });
    return res.status(200).json(posts);
  } catch (err: unknown) {
    if (err instanceof Error) {
      return res.status(500).json({ message: err.message });
    }
    return res.status(500);
  }
};
