import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

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
    const uuid = searchParams.get("uuid");

    if (!uuid) {
      return NextResponse.json({ error: "Exercise UUID is required" }, { status: 400 });
    }

    const client = new MongoClient(uri);
    await client.connect();

    const database = client.db("ArmLing");

    if (!database) {
      throw new Error("Database connection is undefined");
    }

    const SpeakingExerciseCollection = database.collection("SpeakingExercise");
    const exercise = await SpeakingExerciseCollection.findOne({ uuid });

    await client.close();

    if (!exercise) {
      return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
    }

    return NextResponse.json({ task: exercise.title }); // Assuming "title" is the field you want to return
  } catch (error) {
    console.error("Error fetching exercise:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}