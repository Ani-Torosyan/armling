import { Schema, model, models } from "mongoose";

const UserSchema = new Schema({
    clerkId: {
        type: String,
        required: true,
        unique: true,
    },
    userName: {
        type: String,
        required: true,
    },
    userImg: {
        type: String,
        required: true,
    },
    firstName: {
        type: String,
    },
    lastName: {
        type: String,
    },
    userHearts: {
        type: Number,
        default: 5,
    },
    userExp: {
        type: Number,
        default: 0,
    },
    reading: {
        type: [String],
        default: [],
    },
    listening: {
        type: [String],
        default: [],
    },
    speaking: {
        type: [String],
        default: [],
    },
    writing: {
        type: [String],
        default: [],
    },
});

const User = models?.User || model("User", UserSchema);

export default User;

