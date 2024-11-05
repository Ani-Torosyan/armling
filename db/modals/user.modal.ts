import {Schema, model, models} from "mongoose";

const UserSchema = new Schema({
    clerkId: {
        type: String,
        required: true,
        unique: true,
    },
    userName: {
        type: String,
    },
    userImg: {
        type: String,
    },
});

const User = models?.User || model("User", UserSchema);

export default User;