"use client"

import { NextApiRequest, NextApiResponse } from 'next';
import User from '@/modals/user.modal';
import { connect } from '@/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            await connect();
            const users = await User.find().sort({ userExp: -1 }).limit(10);
            res.status(200).json(users);
        } catch (error) {
            console.error('Error fetching users:', error);
            res.status(500).json({ message: 'Error fetching users' });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}