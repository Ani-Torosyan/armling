import { NextApiRequest, NextApiResponse } from "next";
import { MongoClient } from "mongodb";

const uri = "mongodb+srv://uni401753:HeLti3UvesCE0pK9@cluster0.5yati.mongodb.net";
const client = new MongoClient(uri);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        await client.connect();
        const db = client.db("ArmLing");
        const collection = db.collection("users");

        const users = await collection
            .find({})
            .project({ _id: 0, clerkId: 1, userName: 1, userImg: 1, firstName: 1, lastName: 1, userExp: 1 })
            .toArray();

        const currentUserId = req.query.currentUserId; // Pass current user ID from the frontend

        const currentUser = users.find(user => user.clerkId === currentUserId);

        res.status(200).json({ currentUser, users });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Unable to fetch leaderboard data" });
    } finally {
        await client.close();
    }
}
