import { NextResponse } from "next/server";
import SpeakingSubmission from "@/modals/speaking-submission.modal";
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

        if (!database) {
            throw new Error("Database connection is undefined");
        }

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
        if (!client.connect) {
            const client = new MongoClient(uri);
        await client.connect();
        }

        // Save the submission using the SpeakingSubmission model
        const newSubmission = new SpeakingSubmission({
            clerkId: userId,
            exerciseUUID: exerciseId,
            fileUrl: audioUrl,
        });

        await newSubmission.save();

        return NextResponse.json({ message: "Recording metadata saved successfully" });
    } catch (error) {
        console.error("Error saving recording metadata:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}