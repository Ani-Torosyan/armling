import { NextResponse } from "next/server";
import mongoose from "mongoose";
import FeedbackSpeaking from "@/modals/FeedbackSpeaking.modal";
import SpeakingSubmission from "@/modals/speaking-submission.modal";

const uri = process.env.MONGODB_URL || "";

export async function POST(request: Request) {
  if (!uri) {
    return NextResponse.json(
      { error: "MongoDB URL is not defined" },
      { status: 500 }
    );
  }

  try {
    const { submissionId, feedback } = await request.json();

    if (!submissionId || !feedback) {
      return NextResponse.json(
        { error: "Submission ID and feedback are required" },
        { status: 400 }
      );
    }

    if (!mongoose.connection.readyState) {
      await mongoose.connect(uri);
    }

    const newFeedback = new FeedbackSpeaking({
      submissionId,
      feedback,
    });

    await newFeedback.save();
    const updatedSubmission = await SpeakingSubmission.findByIdAndUpdate(
          submissionId,
          { checked: true },
          { new: true }
        );
    return NextResponse.json({ message: "Feedback submitted successfully" });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}