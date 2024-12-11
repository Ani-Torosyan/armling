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

        const SpeakingExerciseCollection = database.collection("SpeakingExercise");
        const SpeakingExercise = await SpeakingExerciseCollection.find({}).toArray();

        await client.close();

        return NextResponse.json({ SpeakingExercise });
    } catch (error) {
        console.error("Error fetching speaking exercise data:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    if (!uri) {
        return NextResponse.json(
            { error: "MongoDB URL is not defined" },
            { status: 500 }
        );
    }

    try {
        const body = await request.json();
        const { userId, exerciseId, audioUrl } = body;

        if (!userId || !exerciseId || !audioUrl) {
            return NextResponse.json(
                { error: "Missing required fields: userId, exerciseId, or audioUrl" },
                { status: 400 }
            );
        }

        const client = new MongoClient(uri);
        await client.connect();

        const database = client.db("ArmLing");

        const UserRecordingsCollection = database.collection("UserRecordings");
        await UserRecordingsCollection.insertOne({
            userId,
            exerciseId,
            audioUrl,
            createdAt: new Date(),
        });

        await client.close();

        return NextResponse.json({ message: "Recording metadata saved successfully" });
    } catch (error) {
        console.error("Error saving recording metadata:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
