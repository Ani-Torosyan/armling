import { NextResponse } from "next/server";
import mongoose from "mongoose";
import FeedbackSpeaking from "@/modals/FeedbackSpeaking.modal";
import FeedbackWriting from "@/modals/FeedbackWriting.modal"; // Assuming you have a FeedbackWriting model
import SpeakingSubmission from "@/modals/speaking-submission.modal";
import WritingSubmission from "@/modals/writing-submission.modal"; // Assuming you have a WritingSubmission model

const uri = process.env.MONGODB_URL || "";

export async function GET(request: Request) {
  if (!uri) {
    return NextResponse.json(
      { error: "MongoDB URL is not defined" },
      { status: 500 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    if (!mongoose.connection.readyState) {
      await mongoose.connect(uri);
    }

    // Find checked speaking submissions for the user
    const speakingSubmissions = await SpeakingSubmission.find({
      clerkId: userId,
      checked: true,
    });

    const speakingSubmissionIds = speakingSubmissions.map((submission) => submission._id);

    // Find feedbacks for the checked speaking submissions
    const speakingFeedbacks = await FeedbackSpeaking.find({
      submissionId: { $in: speakingSubmissionIds },
    }).populate("submissionId");

    // Find checked writing submissions for the user
    const writingSubmissions = await WritingSubmission.find({
      clerkId: userId,
      checked: true,
    });

    const writingSubmissionIds = writingSubmissions.map((submission) => submission._id);

    // Find feedbacks for the checked writing submissions
    const writingFeedbacks = await FeedbackWriting.find({
      submissionId: { $in: writingSubmissionIds },
    }).populate("submissionId");

    // Combine speaking and writing feedbacks
    const feedbacks = [...speakingFeedbacks, ...writingFeedbacks];

    return NextResponse.json(feedbacks);
  } catch (error) {
    console.error("Error fetching feedbacks:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}