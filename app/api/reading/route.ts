import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URL || "";

export async function GET() {
    if (!uri) {
        return NextResponse.json(
            { error: "MongoDB URL is not defined" },
            { status: 500 }
        );
    }

    try {
        const client = new MongoClient(uri);
        await client.connect();

        const database = client.db("ArmLing");

        const ReadingExerciseCollection = database.collection("ReadingExercise");
        const readingExercises = await ReadingExerciseCollection.find({ exerciseType: "Reading" }).toArray();

        await client.close();

        return NextResponse.json(readingExercises, { status: 200 });
    } catch (error) {
        console.error("Error fetching reading exercises:", error);
        return NextResponse.json(
            { error: "Error fetching reading exercises" },
            { status: 500 }
        );
    }
}