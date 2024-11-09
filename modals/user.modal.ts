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
        default: 4, 
    },
    userExp: {
        type: Number,
        default: 0, 
    },
});

const User = models?.User || model("User", UserSchema);

export default User;
