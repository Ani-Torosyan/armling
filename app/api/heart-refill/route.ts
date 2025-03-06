import { NextResponse } from 'next/server';
import { heartRefillJob } from '@/jobs/heartRefillJob';
import User from '@/modals/user.modal';
import { connect } from '@/db';

export async function GET() {
  try {
    await heartRefillJob();
    return new NextResponse("Heart refill job executed successfully.", { status: 200 });
  } catch (error) {
    console.error("Error executing heart refill job:", error);
    return new NextResponse("Failed to execute heart refill job.", { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await connect();

    const body = await request.json();
    const { userId, newHearts, newLastUpdate } = body;

    if (!userId || newHearts == null || !newLastUpdate) {
      return NextResponse.json({ message: "User ID, new hearts, and new last update are required" }, { status: 400 });
    }

    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    user.userHearts = newHearts;
    user.lastHeartUpdate = new Date(newLastUpdate);
    await user.save();

    return NextResponse.json({ message: "Hearts updated successfully", hearts: newHearts });
  } catch (error) {
    console.error("Error updating user hearts:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}