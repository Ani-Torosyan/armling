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

        // Connect to the "ArmLing" database and "users" collection
        const database = client.db("ArmLing"); // Use your correct DB name
        const usersCollection = database.collection("users"); // Use your correct collection name

        // Fetch top 10 users sorted by userExp in descending order
        const users = await usersCollection
            .find({})
            .sort({ userExp: -1 })
            .limit(10)
            .project({
                userName: 1,
                userExp: 1,
                userImg: 1,
                firstName: 1,
                lastName: 1,
            })
            .toArray();

        await client.close();

        return NextResponse.json({ users });
    } catch (error) {
        console.error("Error fetching leaderboard data:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
