import User from "../models/user";
import { RequestHandler } from "express";
import bcrypt, { hash } from "bcrypt";
import jwt from "jsonwebtoken";

export const createUser: RequestHandler = async (req, res) => {
  // Check if username already exists in database
  const checkUserExists = await User.findOne({ username: req.body.username });
  if (checkUserExists) {
    return res
      .status(401)
      .json({ success: false, message: "User already exists" });
  }

  // TODO: check if photo file is attached
  // if not, set default photo to user.

  // Convert path from local to accessible one (replace \ with /)
  let fileUrl = req.file?.path.replace(/\\/g, "/");

  const user = new User({
    username: req.body.username,
    password: await bcrypt.hash(req.body.password, 10),
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
  // Find user object
  const user = await User.findOne({ username: req.body.username }).select(
    "password"
  );

  if (!user) {
    return res
      .status(401)
      .json({ success: false, message: "Could not find user" });
  }

  // User found - compare password to find a match
  // TODO: move validate password to its own function that returns bool
  const match = await bcrypt.compare(req.body.password, user.password);

  if (!match) {
    return res
      .status(401)
      .json({ success: false, message: "Incorrect password" });
  }

  // Authenticate user
  // TODO: create issueJwt util function that we can pass user into,
  // and it will do all this and return jwt

  const payload = {
    sub: user._id,
    // iat: Date.now, TODO: fix this
  };

  const expiresIn = "1d";

  const token = jwt.sign(payload, process.env.JWT_KEY as string, {
    expiresIn,
  });

  return res.status(200).json({
    success: true,
    message: "Logged in successfully",
    token: "Bearer " + token,
    expires: expiresIn,
    user,
  });

  // TODO: catch errors - change format of function
};
