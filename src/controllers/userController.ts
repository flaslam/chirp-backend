import User from "../models/user";
import { RequestHandler } from "express";

export const createUser: RequestHandler = async (req, res) => {
  // Check if username already exists in database
  const checkUserExists = await User.findOne({ username: req.body.username });
  if (checkUserExists) {
    return res
      .status(401)
      .json({ success: false, message: "User already exists" });
  }

  // TODO: check if photo exists, if not don't add it to the user or file url

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

export const loginUser: RequestHandler = async (req, res, next) => {
  // TODO: integrate jwt passport token

  // Find user object
  const user = await User.findOne({ username: req.body.username }).select(
    "password"
  );

  if (!user) {
    return res
      .status(401)
      .json({ success: false, message: "Could not find user" });
  }

  // Use found - compare password to find a match
  const payload = {
    username: user.username,
    id: user._id,
  };

  return res
    .status(200)
    .json({ success: true, message: "Logged in successfully", payload });
};
