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
            completedLessons: user.lesson
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
      const { userId, score, completedLessonUUID, completedReadingUUID, completedListeningUUID, completedSpeakingUUID, completedWritingUUID } = body;
  
      if (!userId || score == null) {
        return NextResponse.json({ message: "User ID and score are required" }, { status: 400 });
      }
  
      const user = await User.findOne({ clerkId: userId });
  
      if (!user) {
        return NextResponse.json({ message: "User not found" }, { status: 404 });
      }
  
      // Update lesson data
      if (completedLessonUUID && !user.lesson.includes(completedLessonUUID)) {
        user.lesson.push(completedLessonUUID);
        user.userExp = score; 
      }
  
      // Update reading exercise data
      if (completedReadingUUID && !user.reading.includes(completedReadingUUID)) {
        user.reading.push(completedReadingUUID);
        user.userExp = score; 
      }
  
      // Update listening exercise data
      if (!user.listening.includes(completedListeningUUID)) {
        user.listening.push(completedListeningUUID);
        user.userExp = score;
      }
  
      // Update speaking exercise data
      if (completedSpeakingUUID && !user.speaking.includes(completedSpeakingUUID)) {
        user.speaking.push(completedSpeakingUUID);
      }
  
  
  
      await user.save();
  
      return NextResponse.json({ message: "User experience and exercises updated successfully", user });
    } catch (error: unknown) {
      console.error("Error updating user data:", error);
      if (error instanceof Error) {
        return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
      } else {
        return NextResponse.json({ message: "Internal Server Error", error: "Unknown error occurred" }, { status: 500 });
      }
    }
  }
  
