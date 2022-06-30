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
  },
  {
    toJSON: { virtuals: true },
  }
);

// Virtual for date
PostSchema.virtual("dateFormatted").get(function () {
  return DateTime.fromJSDate(this.date).toLocaleString(DateTime.DATE_MED);
});

const Post = mongoose.model("Post", PostSchema);

export default Post;
