import Post from "../models/post";
import { RequestHandler } from "express";
import { deleteFile } from "../lib/storage";

// Get all posts on timeline
export const getAllPosts: RequestHandler = async (req, res) => {
  try {
    const user: any = req.user;
    let posts;

    // Default filter to not show any reply posts in the main feed
    let filter: any = { parent: { $in: [null] } };

    // If we have a user, only show posts from users we follow
    if (user) {
      filter = {
        ...filter,
        $or: [{ user: user.following }, { user: user._id }],
      };
    }

    // Pull limit and skip queries from our request
    const limit: number = Number(req.query.limit);
    const skip: number = Number(req.query.skip);

    // Populate user ID with user object and sort in descending order
    posts = await Post.find(filter)
      // .populate("user parent replies reposts likes")
      .populate("user replies reposts likes parent")
      .sort({ date: -1 })
      .limit(limit)
      .skip(skip);

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
  try {
    const post = await Post.findById(req.params.postId)
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

  const post = new Post({
    user: user.id,
    message: req.body.message,
  });

  const parent = req.body.parent;

  if (parent) {
    post.parent = parent;
  }

  if (req.file != null) {
    let fileName = req.body.fileName;
    const media = [fileName];
    post.media = media;
  }

  try {
    const newPost = await post.save();

    // If this post has a parent (is a reply), add this to the parent Post.
    if (parent) {
      await Post.findByIdAndUpdate(parent, {
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
  } catch (err: unknown) {
    if (err instanceof Error) {
      return res.status(400).json({ message: err.message });
    }
    return res.status(400);
  }
};

// Delete post
export const deletePost: RequestHandler = async (req, res, next) => {
  // const post = await Post.findOne({})

  try {
    // TODO: Check if post ID matches user ID

    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res
        .status(400)
        .json({ success: false, message: "Post could not be found." });
    }

    // await Post.deleteOne(req.params.postId);
    // await Post.findOneAndDelete(req.params.postId);

    // Should remove post from its parent

    // Delete all relevant media from S3
    if (post.media && post.media.length > 0) {
      const pathToFile: string = String(post.media[0]);
      try {
        await deleteFile(pathToFile);
      } catch (err) {
        return res
          .status(400)
          .json({ success: false, message: "Could not delete media" });
      }
    }

    post.delete();

    return res
      .status(200)
      .json({ success: true, message: "Successfully deleted post" });
  } catch (err) {
    return res
      .status(400)
      .json({ success: false, message: "Could not delete post.", err: err });
  }
};

// Get posts on a specific user's profile page
export const getUserPosts: RequestHandler = async (req, res) => {
  const user: any = req.user;
  try {
    if (user === undefined) {
      return res.status(404).json({ message: "Cannot find user." });
    }

    // Default filter to not show any reply posts
    let filter: any = { parent: { $in: [null] }, user: user.id };

    // If we have defined a filter in a prior middleware, use that
    if (req.body.filter !== undefined) {
      filter = req.body.filter;
    }

    // Populate user ID with user object and sort in descending order
    const posts = await Post.find(filter)
      .populate("user replies reposts likes replies.user parent")
      .populate({
        path: "parent",
        populate: { path: "user" },
      })
      .sort({
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

export const setFilterToIncludeReplies: RequestHandler = async (
  req,
  res,
  next
) => {
  const user: any = req.user;
  try {
    req.body.filter = { user: user.id };
    next();
  } catch (err) {
    return res.status(401).json({ message: err });
  }
};

export const setFilterToMedia: RequestHandler = async (req, res, next) => {
  const user: any = req.user;
  try {
    req.body.filter = {
      user: user._id,
      media: { $exists: true, $not: { $size: 0 } },
    };
    next();
  } catch (err) {
    return res.status(401).json({ message: err });
  }
};

export const setFilterToLikes: RequestHandler = async (req, res, next) => {
  const user: any = req.user;
  try {
    req.body.filter = { likes: { $in: [user.id] } };
    next();
  } catch (err) {
    return res.status(401).json({ message: err });
  }
};

// Add user from req to post's likes
export const likePost: RequestHandler = async (req, res, next) => {
  const user: any = req.user;
  try {
    if (user === undefined) {
      return res.status(404).json({ message: "Cannot find user." });
    }

    // Like
    if (req.body.like) {
      await Post.findByIdAndUpdate(req.params.postId, {
        $addToSet: { likes: user._id },
      });
      return res.status(200).json({ message: "Added like to post" });
    }

    // Unlike
    if (!req.body.like) {
      await Post.findByIdAndUpdate(req.params.postId, {
        $pull: { likes: user._id },
      });
      return res.status(200).json({ message: "Removed like from post" });
    }

    return res.status(500).json({ message: "Could not process like" });
  } catch (err: unknown) {
    if (err instanceof Error) {
      return res.status(500).json({ message: err.message });
    }
    return res.status(500);
  }
};
