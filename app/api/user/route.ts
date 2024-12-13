import { NextResponse } from 'next/server';
import { connect } from '@/db'; 
import User from '@/modals/user.modal'; 

export async function GET(request: Request) {
    try {
        await connect();

        const url = new URL(request.url); 
        const userId = url.searchParams.get('userId'); 

        if (!userId) {
            return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
        }

        const user = await User.findOne({ clerkId: userId });

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            userName: user.userName,
            userExp: user.userExp,
            userImg: user.userImg,
            firstName: user.firstName,
            lastName: user.lastName,
            userHearts: user.userHearts,
            subscription: user.subscription,
        });
    } catch (error) {
        console.error('Error fetching user data:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        await connect(); 

        const body = await request.json();
        const { userId, score } = body;

        if (!userId || score == null) {
            return NextResponse.json({ message: 'User ID and score are required' }, { status: 400 });
        }

        const user = await User.findOneAndUpdate(
            { clerkId: userId },
            { $set: { userExp: score } }, 
            { new: true } 
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

