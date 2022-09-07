import { DateTime } from "luxon";
import mongoose, { Schema } from "mongoose";

const PostSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true, maxlength: 300, minlength: 1 },
    date: { type: Date, required: true, default: Date.now },
    replies: [{ type: Schema.Types.ObjectId, ref: "Post" }],
    reposts: [{ type: Schema.Types.ObjectId, ref: "Post" }],
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    parent: { type: Schema.Types.ObjectId, ref: "Post" },
    media: [{ type: String }],
  },
  {
    toJSON: { virtuals: true },
  }
);

// Virtual for date
PostSchema.virtual("dateFormatted").get(function () {
  return DateTime.fromJSDate(this.date).toLocaleString(DateTime.DATE_MED);
});

// Virtual for relative date
PostSchema.virtual("dateRelative").get(function () {
  const date = DateTime.local();
  const postDate = DateTime.fromJSDate(this.date);
  const relativeDate = postDate.toRelative({ base: date });
  return relativeDate;
});

// Virtual for time
PostSchema.virtual("time").get(function () {
  return DateTime.fromJSDate(this.date).toFormat("h:mm a");
});

const Post = mongoose.model("Post", PostSchema);

export default Post;
