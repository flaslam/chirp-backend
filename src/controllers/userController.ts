import User from "../models/user";
import { RequestHandler } from "express";
import { fileURLToPath } from "url";

export const createUser: RequestHandler = async (req, res) => {
  // TODO: Check if username already exists

  // Convert path from local to accessible one (replace \ with /)
  let fileUrl = req.file?.path.replace(/\\/g, "/");

  const user = new User({
    username: req.body.username,
    password: req.body.password,
    displayName: req.body.displayName,
    photo: fileUrl,
  });

  try {
    const newUser = await user.save();
    res.status(201).json({
      success: true,
      message: `User ${newUser.username} created successfully`,
      user: { id: newUser._id, username: newUser.username },
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      return res.status(500).json({ message: err.message });
    }
    return res.status(500);
  }
};

export const uploadFile: RequestHandler = async (req, res, next) => {
  console.log("made it here ");
  console.log(req.file);
  return req;
};
