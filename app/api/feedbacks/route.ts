import { NextResponse } from "next/server";
import { connect } from "@/db";
import FeedbackWriting from "@/modals/FeedbackWriting.modal";
import WritingSubmission from "@/modals/writing-submission.modal";

export async function GET(request: Request) {
  try {
    await connect();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ message: "User ID is required." }, { status: 400 });
    }

    // Fetch feedbacks for the user's submissions
    const feedbacks = await FeedbackWriting.find()
      .populate({
        path: "submissionId",
        match: { clerkId: userId }, // Match submissions belonging to the current user
        select: "exerciseUUID fileUrl exerciseName", // Include exerciseName
      })
      .exec();

    // Filter out feedbacks where the submissionId is null (not matching the user)
    const filteredFeedbacks = feedbacks.filter((feedback) => feedback.submissionId);

    return NextResponse.json(filteredFeedbacks, { status: 200 });
  } catch (error) {
    console.error("Error fetching feedbacks:", error);
    return NextResponse.json(
      { message: "Failed to fetch feedbacks.", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}