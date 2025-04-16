import { NextResponse } from "next/server";
import { connect } from "@/db";
import WritingSubmission from "@/modals/writing-submission.modal";
import User from "@/modals/user.modal";

export async function GET() {
  try {
    // Connect to the database
    await connect();

    // Fetch all writing submissions, sorted by creation date (newest first)
    const submissions = await WritingSubmission.find().sort({ createdAt: -1 });

    // Fetch user nicknames and attach them to submissions
    const submissionsWithNicknames = await Promise.all(
      submissions.map(async (submission) => {
        try {
          const user = await User.findOne({ clerkId: submission.clerkId });
          return {
            ...submission.toObject(),
            nickname: user?.userName || "Unknown", // Use "Unknown" if no nickname is found
          };
        } catch (error) {
          console.error(`Error fetching user for clerkId ${submission.clerkId}:`, error);
          return {
            ...submission.toObject(),
            nickname: "Unknown", // Default to "Unknown" if user lookup fails
          };
        }
      })
    );

    // Return the submissions with nicknames
    return NextResponse.json(submissionsWithNicknames, { status: 200 });
  } catch (error) {
    console.error("Error fetching writing submissions:", error);
    return NextResponse.json(
      {
        message: "Failed to fetch writing submissions.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}