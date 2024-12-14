import { NextApiRequest, NextApiResponse } from 'next';
import User from '@/modals/user.modal';
import { connect } from '@/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        try {
            await connect();
            await User.updateOne({ clerkId: userId }, { $set: { subscription: true } });
            return res.status(200).json({ message: 'Subscription updated successfully' });
        } catch (error) {
            console.error('Error updating subscription:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        return res.status(405).json({ error: 'Method not allowed' });
    }
}