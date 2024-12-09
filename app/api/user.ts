import { NextApiRequest, NextApiResponse } from 'next';
import { connect } from '@/db'; // Your MongoDB connection function
import User from '@/modals/user.modal'; // Your User model

export async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        await connect(); // Connect to the database
        const { clerkId } = req.query; // Get clerkId from the query params (you can also get it from the session)

        if (!clerkId) {
            return res.status(400).json({ message: 'Clerk ID is required' });
        }

        const user = await User.findOne({ clerkId }); // Find user by clerkId

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json(user); // Return the user data
    } catch (error) {
        console.error('Error fetching user data:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

export default handler;
