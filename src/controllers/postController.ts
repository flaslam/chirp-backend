import Post from "../models/post";
import { RequestHandler } from "express";

// Get all posts
export const getAllPosts: RequestHandler = async (req, res) => {
  try {
    // Populate user ID with user object and sort in descending order
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

// Create new post
export const createPost: RequestHandler = async (req, res) => {
  const user: any = req.user;

  const post = new Post({
    user: user.id,
    message: req.body.message,
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
