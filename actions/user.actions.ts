"use server";

import User from "@/modals/user.modal"
import { connect } from "@/db"

export async function createUser(user: any) {
    try {
        await connect ();
        const newUser = await User.create(user);
        return JSON.parse(JSON.stringify(newUser));

    } catch (error) {
        console.log(error);
    }
}

export async function getUserData(userId: string | null) {
    try {
        const user = await User.findOne({ clerkId: userId });
        return user ? { userHearts: user.userHearts, userExp: user.userExp } : null;
    } catch (error) {
        console.error("Error fetching user data:", error);
        return null;
    }
}
