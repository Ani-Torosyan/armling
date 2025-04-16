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
            completedReadingExercises: user.reading,
            completedListeningExercises: user.listening,
            completedSpeakingExercises: user.speaking,
            completedWritingExercises: user.writing,
            completedLessons: user.lesson,
            lastHeartUpdate: user.lastHeartUpdate, // Include lastHeartUpdate in the response
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
      const { userId, score, completedListeningUUID, completedReadingUUID, completedSpeakingUUID } = body;
  
      if (!userId || score == null) {
        return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
      }
  
      const user = await User.findOne({ clerkId: userId });
  
      if (!user) {
        return NextResponse.json({ message: "User not found" }, { status: 404 });
      }
  
      user.userExp = score;
  
      
      if (completedListeningUUID && !user.listening.includes(completedListeningUUID)) {
        user.listening.push(completedListeningUUID);
      }
  
      
      if (completedReadingUUID && !user.reading.includes(completedReadingUUID)) {
        user.reading.push(completedReadingUUID);
      }

      if (completedSpeakingUUID && !user.speaking.includes(completedSpeakingUUID)) {
        user.speaking.push(completedSpeakingUUID);
      }
  
      await user.save();
  
      return NextResponse.json({ message: "User data updated successfully" }, { status: 200 });
    } catch (error) {
      console.error("Error updating user data:", error);
      return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
  }
  
  