import { NextApiRequest, NextApiResponse } from "next";
import { connect } from "@/db"; // MongoDB connection function
import User from "@/modals/user.modal"; // MongoDB User model

export async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        await connect(); // Connect to the database

        const { userId } = req.query; // Get userId from query parameters

        if (!userId) {
            console.error("Missing userId in request query");
            return res.status(400).json({ message: "User ID is required" });
        }

        console.log("Fetching user with userId:", userId);

        // Find the user by userId (Clerk's userId)
        const user = await User.findOne({ clerkId: userId });

        if (!user) {
            console.error("User not found for userId:", userId);
            return res.status(404).json({ message: "User not found" });
        }

        console.log("Found user:", user);

        // Return necessary user data
        return res.status(200).json({
            userId: user.clerkId,
            username: user.userName,
            hearts: user.userHearts,
            exp: user.userExp,
            img: user.userImg,
        });
    } catch (error) {
        console.error("Error fetching user data:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

export default handler;
