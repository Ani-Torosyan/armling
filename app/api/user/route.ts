import { NextResponse } from 'next/server';
import { connect } from '@/db'; // MongoDB connection function
import User from '@/modals/user.modal'; // MongoDB User model

// Fetch user data
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

// Update user data (e.g., userExp)
export async function PUT(request: Request) {
    try {
        await connect(); // Connect to the database

        const body = await request.json(); // Parse the JSON body
        const { userId, score } = body; // Destructure necessary fields from the request

        if (!userId || score == null) {
            return NextResponse.json({ message: 'User ID and score are required' }, { status: 400 });
        }

        // Find the user by Clerk's userId and update their experience points
        const user = await User.findOneAndUpdate(
            { clerkId: userId },
            { $set: { userExp: score } }, // Update userExp field
            { new: true } // Return the updated document
        );

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'User experience updated successfully', user });

    } catch (error) {
        console.error('Error updating user data:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

