import { DateTime } from "luxon";
import mongoose, { Schema } from "mongoose";

var UserSchema = new Schema(
  {
    username: { type: String, required: true, minlength: 1 },
    password: { type: String, required: true, minlength: 1, select: false },
    displayName: { type: String, required: true },
    photo: { type: String, required: true, default: "images/default.png" },
    joinDate: { type: Date, required: true, default: Date.now },

    followers: [
      { type: Schema.Types.ObjectId, ref: "User", required: true, default: [] },
    ],
    following: [
      { type: Schema.Types.ObjectId, ref: "User", required: true, default: [] },
    ],

    header: { type: String },
    bio: { type: String },
    location: { type: String },
    url: { type: String },
    // TODO: pinnedPost
  },
  {
    toJSON: { virtuals: true },
  }
);

// Virtual for date joined
UserSchema.virtual("dateJoinedFormatted").get(function () {
  return DateTime.fromJSDate(this.joinDate).toLocaleString(DateTime.DATE_MED);
});

const User = mongoose.model("User", UserSchema);

export default User;
