import { NextResponse } from "next/server";
import { connect } from "@/db";
import User from "@/modals/user.modal";

export async function GET(req: Request) {
    await connect();

    const { searchParams } = new URL(req.url);
    const clerkId = searchParams.get("clerkId");

    if (!clerkId) {
        return NextResponse.json({ error: "Missing clerkId" }, { status: 400 });
    }

    try {
        const user = await User.findOne({ clerkId });
        return NextResponse.json({ subscription: user?.subscription || false });
    } catch (error) {
        console.error("Database error:", error);
        return NextResponse.json({ error: "Database error" }, { status: 500 });
    }
}

