import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

// MongoDB URL from environment variable
const uri = process.env.MONGODB_URL || "";

export async function GET() {
  if (!uri) {
    return NextResponse.json(
      { error: "MongoDB URL is not defined" },
      { status: 500 }
    );
  }

  try {
    // Connect to MongoDB
    const client = new MongoClient(uri);
    await client.connect();

    const database = client.db("Cluster0"); // Adjust to match your DB name
    const usersCollection = database.collection("users");

    // Fetch top 10 users sorted by userExp in descending order
    const users = await usersCollection
      .find({})
      .sort({ userExp: -1 }) // Sort by experience in descending order
      .limit(10) // Limit to top 10 users
      .toArray();

    await client.close();

    // Return the top 10 users as JSON response
    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error fetching leaderboard data:", error);

    // Handle database or internal server errors
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
