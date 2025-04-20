import { NextResponse } from "next/server";
import { connect } from "@/db";
import WritingSubmission from "@/modals/writing-submission.modal";
import FeedbackWriting from "@/modals/FeedbackWriting.modal";

export async function GET(request: Request) {
  try {
    // Connect to the database
    await connect();

    // Extract userId from query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const exerciseUUID = searchParams.get("exerciseUUID");

    if (!userId || !exerciseUUID) {
      return NextResponse.json(
        { message: "User ID and exercise UUID are required." },
        { status: 400 }
      );
    }

    // Check if the user has a submission for the given exercise
    const submission = await WritingSubmission.findOne({
      clerkId: userId,
      exerciseUUID,
    });

    if (!submission) {
      return NextResponse.json(
        { message: "No submission found for this user and exercise." },
        { status: 404 }
      );
    }

    // Check if there is feedback for the submission
    const feedback = await FeedbackWriting.findOne({
      submissionId: submission._id,
    });

    return NextResponse.json(
      {
        submission: {
          id: submission._id,
          fileUrl: submission.fileUrl,
          checked: submission.checked,
          createdAt: submission.createdAt,
        },
        feedback: feedback
          ? {
              id: feedback._id,
              feedback: feedback.feedback,
              createdAt: feedback.createdAt,
            }
          : null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching submission and feedback:", error);
    return NextResponse.json(
      {
        message: "Failed to fetch submission and feedback.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}