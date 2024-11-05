/*import { clerkClient } from "@clerk/nextjs/server";
import { WebhookEvent } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "lucide-react";
import { createUser } from "@/db/actions/user.actions";*/

import { NextResponse } from 'next/server';

export async function POST(req: Request) {
   // Your API logic here
   return NextResponse.json({ message: 'Success' });
}
