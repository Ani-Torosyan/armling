import { NextResponse } from 'next/server';
import { connect } from '@/db'; // MongoDB connection function
import User from '@/modals/user.modal'; // MongoDB User model

export async function GET(request: Request) {
    try {
        await connect(); // Connect to the database

        const url = new URL(request.url); // Parse the URL from the request
        const userId = url.searchParams.get('userId'); // Get userId from the query parameters

        if (!userId) {
            return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
        }

        // Find the user by userId (Clerk's userId)
        const user = await User.findOne({ clerkId: userId });

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        // Return necessary user data, including the last heart update
        return NextResponse.json({
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
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
