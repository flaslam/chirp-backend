import mongoose, { Schema } from "mongoose";

var UserSchema = new Schema({
  username: { type: String, required: true, minlength: 1 },
  password: { type: String, required: true, minlength: 1, select: false },
  displayName: { type: String, required: true },
  photo: { type: String, required: true, default: "default.png" },
});

const User = mongoose.model("User", UserSchema);

export default User;
