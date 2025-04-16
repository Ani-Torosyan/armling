import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URL || "";

export async function GET(request: Request) {
  if (!uri) {
    return NextResponse.json(
      { message: "MongoDB URL is not defined." },
      { status: 500 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const exerciseUUID = searchParams.get("uuid");

    if (!exerciseUUID) {
      return NextResponse.json({ message: "Exercise UUID is required." }, { status: 400 });
    }

    const client = new MongoClient(uri);
    await client.connect();

    const database = client.db("ArmLing");
    const collection = database.collection("WritingExercise");

    const exercise = await collection.findOne({ uuid: exerciseUUID });

    await client.close();

    if (!exercise) {
      return NextResponse.json({ message: "Exercise not found." }, { status: 404 });
    }

    // Return task and exerciseType instead of title
    return NextResponse.json(
      { task: exercise.task, exerciseType: exercise.exerciseType },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching exercise name:", error);
    return NextResponse.json(
      { message: "Failed to fetch exercise name.", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}