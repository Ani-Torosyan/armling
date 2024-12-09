import { NextApiRequest, NextApiResponse } from 'next';
import { connect } from '@/db'; // MongoDB connection function
import User from '@/modals/user.modal'; // MongoDB User model

export async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        await connect(); // Connect to the database

        const { userId } = req.query; // Get userId from query parameters

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        // Find the user by userId (Clerk's userId)
        const user = await User.findOne({ clerkId: userId });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Return necessary user data, including the last heart update
        return res.status(200).json({
            userName: user.userName,
            userExp: user.userExp,
            userImg: user.userImg,
            firstName: user.firstName,
            lastName: user.lastName,
            userHearts: user.userHearts,
            lastHeartUpdate: user.lastHeartUpdate,
        });
    } catch (error) {
        console.error('Error fetching user data:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

export default handler;
