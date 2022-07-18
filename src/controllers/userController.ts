import User from "../models/user";
import { RequestHandler } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// TODO: move functions to utils file for verifying pw, issuing token, and generating pw

export const createUser: RequestHandler = async (req, res, next) => {
  // Check if username already exists in database
  const checkUserExists = await User.findOne({ username: req.body.username });
  if (checkUserExists) {
    return res
      .status(401)
      .json({ success: false, message: "User already exists" });
  }

  // TODO: check if photo file is attached
  // if not, set default photo to user.

  // TODO: change filename to user ID? has to happen after creating obj,
  // so split up the sign up process into multiple steps.
  // create the profile after creating the account to fill in all optionals

  // Convert path from local to accessible one (replace \ with /)
  let fileUrl = req.file?.path.replace(/\\/g, "/");

  const user = new User({
    username: req.body.username,
    password: await bcrypt.hash(req.body.password, 10),
    displayName: req.body.displayName,
  });

  if (req.file && fileUrl) {
    user.photo = fileUrl;
  }

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

export const loginUser: RequestHandler = async (req, res, next) => {
  // Find user object
  const user = await User.findOne({ username: req.body.username }).select(
    "+password"
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
    iat: Date.now(),
  };

  const expiresIn = "1d";

  const token = jwt.sign(payload, process.env.JWT_KEY as string, {
    expiresIn,
  });

  // TODO: Make sure we don't return the user password
  return res.status(200).json({
    success: true,
    message: "Logged in successfully",
    token: "Bearer " + token,
    expires: expiresIn,
    iat: Date.now(),
    user: user,
  });

  // TODO: catch errors - change format of function
};

export const getUserFromParam: RequestHandler = async (req, res, next) => {
  // Find user from name param
  try {
    const user = await User.findOne({ username: req.params.username });
    if (user === null) {
      return res.status(404).json({ message: "Cannot find user." });
    }
    req.user = user;
    next();
  } catch (err: unknown) {
    if (err instanceof Error) {
      return res.status(500).json({ message: err.message });
    }
    return res.status(500);
  }
};

export const getUserById: RequestHandler = async (req, res, next) => {
  // Find user from body
  try {
    const user = await User.findOne({ username: req.body.username });
    if (user === null) {
      return res.status(404).json({ message: "Cannot find user." });
    }
    req.user = user;
    next();
  } catch (err: unknown) {
    if (err instanceof Error) {
      return res.status(500).json({ message: err.message });
    }
    return res.status(500);
  }
};

export const returnUser: RequestHandler = async (req, res, next) => {
  // TODO: could this be done using getuserfromparams before this and just
  // pulling from there
  try {
    const user = await User.findOne({ username: req.params.username }).populate(
      "followers following"
    );
    if (user === null) {
      return res.status(404).json({ message: "Cannot find user." });
    }
    return res.status(200).json({ message: "Found user", user });
  } catch (err: unknown) {
    if (err instanceof Error) {
      return res.status(500).json({ message: err.message });
    }
    return res.status(500);
  }
};

export const followUser: RequestHandler = async (req, res, next) => {
  try {
    // Find the user we want to follow from params
    const userToFollow = await User.findOne({ username: req.params.username });
    if (userToFollow === null) {
      return res.status(404).json({ message: "Cannot find user." });
    }

    // Find the user initiating the follow from body
    const user = await User.findOne({ username: req.body.username });
    if (user === null) {
      return res.status(404).json({ message: "Cannot find user." });
    }

    if (!userToFollow || !user) {
      return res.status(500).json({ message: "Users could not be found" });
    }

    // We have both users
    if (req.body.follow) {
      console.log(user.username + " will follow " + userToFollow.username);
      // add to set so if not already in, then add.
      await User.updateOne(
        { _id: user._id },
        { $addToSet: { following: userToFollow._id } }
      );

      console.log(user._id);

      await User.updateOne(
        { _id: userToFollow._id },
        { $addToSet: { followers: user._id } }
      );

      console.log(userToFollow._id);

      return res.status(200).json({ message: "Followed user" });
    }

    if (!req.body.follow) {
      // Unfollow
      await User.updateOne(
        { _id: userToFollow._id },
        { $pull: { followers: user._id } }
      );
      await User.updateOne(
        { _id: user._id },
        { $pull: { following: userToFollow._id } }
      );
      return res.status(200).json({ message: "Unfollowed user" });
    }

    return res
      .status(500)
      .json({ message: "Could not update following status" });
  } catch {
    return res.status(500);
  }
};

export const unfollowUser: RequestHandler = async (req, res, next) => {
  try {
    return res.status(200).json({ message: "Unfollowed user" });
  } catch {
    return res.status(500);
  }
};

export const updateProfile: RequestHandler = async (req, res, next) => {
  if (!req.user) return res.status(500).json({ message: "No authorised user" });
  // We are dealing with form data if uploading images so we have to use multer.

  try {
    let updatedValues: any = {};

    if (req.body.name) updatedValues.displayName = req.body.name;
    if (req.body.bio) updatedValues.bio = req.body.bio;
    if (req.body.location) updatedValues.location = req.body.location;
    if (req.body.website) updatedValues.url = req.body.website;

    //@ts-ignore
    await User.findOneAndUpdate(req.user._id, updatedValues);

    return res.status(200).json({ message: "User profile updated" });
  } catch (err) {
    return res.status(400).json({ message: err });
  }
};
