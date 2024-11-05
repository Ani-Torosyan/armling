import {Schema, model, models} from "mongoose";

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
});

const User = models?.User || model("User", UserSchema);

export default User;