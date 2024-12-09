import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  clerkId: { type: String, required: true },
  userName: { type: String, required: true },
  userImg: { type: String },
  firstName: { type: String },
  lastName: { type: String },
  userHearts: { type: Number, default: 5, max: 5 },
  userExp: { type: Number, default: 0 },
  reading: { type: Number, default: 0 },
  listening: { type: Number, default: 0 },
  speaking: { type: Number, default: 0 },
  writing: { type: Number, default: 0 },
  lastHeartUpdate: { type: Date, default: new Date() }, // Timestamp for heart refill
});

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
