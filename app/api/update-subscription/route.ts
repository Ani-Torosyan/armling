import { NextResponse } from 'next/server';
import { connect } from '@/db';
import User from '@/modals/user.modal';

export async function PUT(request: Request) {
    try {
        await connect();

        const body = await request.json();
        const { userId } = body;

        if (!userId) {
            return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
        }

        const user = await User.findOneAndUpdate(
            { clerkId: userId },
            { $set: { subscription: true } },
            { new: true }
        );

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Subscription updated successfully', user });

    } catch (error) {
        console.error('Error updating subscription:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}