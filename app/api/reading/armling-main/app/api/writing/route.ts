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

        // Fetch data from WritingExercises collection
        const WritingExerciseCollection = database.collection("WritingExercise");
        const WritingExercises = await WritingExerciseCollection.find({}).toArray();

        await client.close();

        return NextResponse.json({ WritingExercises });
    } catch (error) {
        console.error("Error fetching writing exercises data:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}