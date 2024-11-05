import { auth, currentUser } from "@clerk/nextjs/server";
import { stat } from "fs";
import { NextResponse } from "next/server";

export async function GET() {
    const { userId } = await auth();
    const user = await currentUser();

    if(!userId) {
        return NextResponse.json({ message: "Not Authenticated" }, { status: 401 });
    }

    return NextResponse.json(
        {
            message: "Authenticated",
            data: { userId: userId, username: user?.username },
        },
        { status: 200 }
    );
}