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
        
        // Fetch data from LessonUnits
        const lessonUnitsCollection = database.collection("LessonUnits");
        const lessonUnits = await lessonUnitsCollection.find({}).toArray();

        // Fetch data from LessonExercise
        const lessonExercisesCollection = database.collection("LessonExercise");
        const lessonExercises = await lessonExercisesCollection.find({}).toArray();

        await client.close();

        return NextResponse.json({ lessonUnits, lessonExercises });
    } catch (error) {
        console.error("Error fetching lesson data:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
