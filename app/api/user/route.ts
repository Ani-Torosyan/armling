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