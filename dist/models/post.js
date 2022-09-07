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
const PostSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true, maxlength: 300, minlength: 1 },
    date: { type: Date, required: true, default: Date.now },
    replies: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Post" }],
    reposts: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Post" }],
    likes: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
    parent: { type: mongoose_1.Schema.Types.ObjectId, ref: "Post" },
    media: [{ type: String }],
}, {
    toJSON: { virtuals: true },
});
// Virtual for date
PostSchema.virtual("dateFormatted").get(function () {
    return luxon_1.DateTime.fromJSDate(this.date).toLocaleString(luxon_1.DateTime.DATE_MED);
});
// Virtual for relative date
PostSchema.virtual("dateRelative").get(function () {
    const date = luxon_1.DateTime.local();
    const postDate = luxon_1.DateTime.fromJSDate(this.date);
    const relativeDate = postDate.toRelative({ base: date });
    return relativeDate;
});
// Virtual for time
PostSchema.virtual("time").get(function () {
    return luxon_1.DateTime.fromJSDate(this.date).toFormat("h:mm a");
});
const Post = mongoose_1.default.model("Post", PostSchema);
exports.default = Post;
