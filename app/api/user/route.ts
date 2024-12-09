import { NextRequest, NextResponse } from "next/server";
import User from "@/modals/user.modal";
import { connect } from "@/db";

export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const userId = url.searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ message: "User ID is required" }, { status: 400 });
        }

        await connect();

        const user = await User.findOne({ clerkId: userId });

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        return NextResponse.json({
            userHearts: user.userHearts,
            userName: user.userName,
            userImg: user.userImg,
        });
    } catch (error) {
        console.error("Error fetching user data:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
