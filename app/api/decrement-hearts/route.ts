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

    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Decrement hearts and update lastHeartUpdate
    const newHearts = Math.max(0, user.userHearts - 1);
    user.userHearts = newHearts;
    user.lastHeartUpdate = new Date(); // Update the lastHeartUpdate field
    await user.save();

    return NextResponse.json({
      message: 'Hearts updated successfully',
      hearts: newHearts,
      lastHeartUpdate: user.lastHeartUpdate,
    });
  } catch (error) {
    console.error('Error updating user hearts:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}