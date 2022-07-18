"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const luxon_1 = require("luxon");
const mongoose_1 = __importStar(require("mongoose"));
var UserSchema = new mongoose_1.Schema({
    username: { type: String, required: true, minlength: 1 },
    password: { type: String, required: true, minlength: 1, select: false },
    displayName: { type: String, required: true },
    photo: { type: String, required: true, default: "images/default.png" },
    joinDate: { type: Date, required: true, default: Date.now },
    followers: [
        { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true, default: [] },
    ],
    following: [
        { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true, default: [] },
    ],
    header: { type: String },
    bio: { type: String },
    location: { type: String },
    url: { type: String },
    // TODO: pinnedPost
}, {
    toJSON: { virtuals: true },
});
// Virtual for date joined
UserSchema.virtual("joinDateFormatted").get(function () {
    return luxon_1.DateTime.fromJSDate(this.joinDate).toLocaleString(luxon_1.DateTime.DATE_MED);
});
const User = mongoose_1.default.model("User", UserSchema);
exports.default = User;
