import { NextResponse } from "next/server";
import mongoose from "mongoose";
import SpeakingSubmission from "@/modals/speaking-submission.modal";

const uri = process.env.MONGODB_URL || "";

export async function GET() {
  if (!uri) {
    return NextResponse.json(
      { error: "MongoDB URL is not defined" },
      { status: 500 }
    );
  }

  try {
    if (!mongoose.connection.readyState) {
      await mongoose.connect(uri);
    }

    const submissions = await SpeakingSubmission.find({ checked: false });
    return NextResponse.json({ submissions });
  } catch (error) {
    console.error("Error fetching unchecked submissions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  if (!uri) {
    return NextResponse.json(
      { error: "MongoDB URL is not defined" },
      { status: 500 }
    );
  }

  try {
    const id = request.url.split("/").pop();
    if (!id) {
      return NextResponse.json(
        { error: "Invalid ID in the request URL" },
        { status: 400 }
      );
    }
    const body = await request.json();

    if (!mongoose.connection.readyState) {
      await mongoose.connect(uri);
    }

    await SpeakingSubmission.findByIdAndUpdate(id, { checked: body.checked });
    return NextResponse.json({ message: "Submission updated successfully" });
  } catch (error) {
    console.error("Error updating submission:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}