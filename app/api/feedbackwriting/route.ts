import { NextResponse } from "next/server";
import { connect } from "@/db";
import FeedbackWriting from "@/modals/FeedbackWriting.modal";
import WritingSubmission from "@/modals/writing-submission.modal";
import mongoose from "mongoose";

export async function POST(request: Request) {
  try {
    const { submissionId, feedback } = await request.json();

    // Validate input
    if (!submissionId || !feedback) {
      return NextResponse.json(
        { message: "Submission ID and feedback are required." },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(submissionId)) {
      return NextResponse.json(
        { message: "Invalid submission ID." },
        { status: 400 }
      );
    }

    console.log("Saving feedback:", { submissionId, feedback });

    // Connect to the database
    await connect();

    // Save feedback in the FeedbackWriting collection
    const feedbackEntry = new FeedbackWriting({
      submissionId,
      feedback,
    });
    const savedFeedback = await feedbackEntry.save();
    console.log("Feedback saved:", savedFeedback);

    // Update the WritingSubmission to mark it as checked
    const updatedSubmission = await WritingSubmission.findByIdAndUpdate(
      submissionId,
      { checked: true },
      { new: true }
    );
    console.log("Updated WritingSubmission:", updatedSubmission);

    if (!updatedSubmission) {
      return NextResponse.json(
        { message: "Writing submission not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Feedback submitted successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return NextResponse.json(
      { message: "Failed to submit feedback.", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}