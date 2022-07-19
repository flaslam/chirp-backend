"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.unfollowUser = exports.followUser = exports.returnUser = exports.getUserById = exports.getUserFromParam = exports.loginUser = exports.createUser = void 0;
const user_1 = __importDefault(require("../models/user"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// TODO: move functions to utils file for verifying pw, issuing token, and generating pw
const createUser = async (req, res, next) => {
    var _a;
    // Check if username already exists in database
    const checkUserExists = await user_1.default.findOne({ username: req.body.username });
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
    let fileUrl = (_a = req.file) === null || _a === void 0 ? void 0 : _a.path.replace(/\\/g, "/");
    const user = new user_1.default({
        username: req.body.username,
        password: await bcrypt_1.default.hash(req.body.password, 10),
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
    }
    catch (err) {
        if (err instanceof Error) {
            return res.status(500).json({ message: err.message });
        }
        return res.status(500);
    }
};
exports.createUser = createUser;
const loginUser = async (req, res, next) => {
    // Find user object
    const user = await user_1.default.findOne({ username: req.body.username }).select("+password");
    if (!user) {
        return res
            .status(401)
            .json({ success: false, message: "Could not find user" });
    }
    // User found - compare password to find a match
    // TODO: move validate password to its own function that returns bool
    const match = await bcrypt_1.default.compare(req.body.password, user.password);
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
    const token = jsonwebtoken_1.default.sign(payload, process.env.JWT_KEY, {
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
exports.loginUser = loginUser;
const getUserFromParam = async (req, res, next) => {
    // Find user from name param
    try {
        const user = await user_1.default.findOne({ username: req.params.username });
        if (user === null) {
            return res.status(404).json({ message: "Cannot find user." });
        }
        req.user = user;
        next();
    }
    catch (err) {
        if (err instanceof Error) {
            return res.status(500).json({ message: err.message });
        }
        return res.status(500);
    }
};
exports.getUserFromParam = getUserFromParam;
const getUserById = async (req, res, next) => {
    // Find user from body
    try {
        const user = await user_1.default.findOne({ username: req.body.username });
        if (user === null) {
            return res.status(404).json({ message: "Cannot find user." });
        }
        req.user = user;
        next();
    }
    catch (err) {
        if (err instanceof Error) {
            return res.status(500).json({ message: err.message });
        }
        return res.status(500);
    }
};
exports.getUserById = getUserById;
const returnUser = async (req, res, next) => {
    // TODO: could this be done using getuserfromparams before this and just
    // pulling from there
    try {
        const user = await user_1.default.findOne({ username: req.params.username }).populate("followers following");
        if (user === null) {
            return res.status(404).json({ message: "Cannot find user." });
        }
        return res.status(200).json({ message: "Found user", user });
    }
    catch (err) {
        if (err instanceof Error) {
            return res.status(500).json({ message: err.message });
        }
        return res.status(500);
    }
};
exports.returnUser = returnUser;
const followUser = async (req, res, next) => {
    try {
        // Find the user we want to follow from params
        const userToFollow = await user_1.default.findOne({ username: req.params.username });
        if (userToFollow === null) {
            return res.status(404).json({ message: "Cannot find user." });
        }
        // Find the user initiating the follow from body
        const user = await user_1.default.findOne({ username: req.body.username });
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
            await user_1.default.updateOne({ _id: user._id }, { $addToSet: { following: userToFollow._id } });
            console.log(user._id);
            await user_1.default.updateOne({ _id: userToFollow._id }, { $addToSet: { followers: user._id } });
            console.log(userToFollow._id);
            return res.status(200).json({ message: "Followed user" });
        }
        if (!req.body.follow) {
            // Unfollow
            await user_1.default.updateOne({ _id: userToFollow._id }, { $pull: { followers: user._id } });
            await user_1.default.updateOne({ _id: user._id }, { $pull: { following: userToFollow._id } });
            return res.status(200).json({ message: "Unfollowed user" });
        }
        return res
            .status(500)
            .json({ message: "Could not update following status" });
    }
    catch (_a) {
        return res.status(500);
    }
};
exports.followUser = followUser;
const unfollowUser = async (req, res, next) => {
    try {
        return res.status(200).json({ message: "Unfollowed user" });
    }
    catch (_a) {
        return res.status(500);
    }
};
exports.unfollowUser = unfollowUser;
const updateProfile = async (req, res, next) => {
    var _a;
    if (!req.user)
        return res.status(500).json({ message: "No authorised user" });
    // We are dealing with form data if uploading images so we have to use multer.
    try {
        console.log(req.body);
        let updatedValues = {};
        if (req.body.name)
            updatedValues.displayName = req.body.name;
        if (req.body.bio)
            updatedValues.bio = req.body.bio;
        if (req.body.location)
            updatedValues.location = req.body.location;
        if (req.body.website)
            updatedValues.url = req.body.website;
        if (req.file) {
            // Convert path from local to accessible one (replace \ with /)
            let fileUrl = (_a = req.file) === null || _a === void 0 ? void 0 : _a.path.replace(/\\/g, "/");
            if (req.file && fileUrl) {
                updatedValues.photo = fileUrl;
            }
        }
        //@ts-ignore
        await user_1.default.findOneAndUpdate(req.user._id, updatedValues);
        return res.status(200).json({ message: "User profile updated" });
    }
    catch (err) {
        return res.status(400).json({ message: err });
    }
};
exports.updateProfile = updateProfile;
