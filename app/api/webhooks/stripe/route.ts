//test

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { connect } from "@/db";
import User from "@/modals/user.modal"; // Ensure correct path

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-02-24.acacia",
});

export async function POST(req: Request) {
    const sig = req.headers.get("stripe-signature");

    if (!sig) {
        return NextResponse.json({ error: "No signature" }, { status: 400 });
    }

    let event;

    try {
        const rawBody = await req.text(); // Get raw body
        event = stripe.webhooks.constructEvent(
            rawBody,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err: any) {
        console.error("⚠️ Webhook error:", err.message);
        return NextResponse.json({ error: "Webhook Error" }, { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
        await connect();
        const session = event.data.object;
        const userId = session.metadata?.userId; // Get userId from metadata

        if (userId) {
            try {
                await User.findOneAndUpdate(
                    { clerkId: userId },
                    { subscription: true }
                );
                console.log(`✅ Subscription updated for ${userId}`);
            } catch (error) {
                console.error("❌ MongoDB update error:", error);
                return NextResponse.json({ error: "Database error" }, { status: 500 });
            }
        }
    }

    return NextResponse.json({ received: true });
}
