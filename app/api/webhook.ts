import { NextResponse } from "next/server";
import Stripe from "stripe";
import { connect } from "@/db";
import User from "@/modals/user.modal"; // ✅ Use your existing User model

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-02-24.acacia",
});

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature") as string;
  let event;

  try {
    const rawBody = await req.text();
    console.log("✅ Received webhook event:", rawBody);

    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );

    console.log("✅ Webhook verified successfully:", event.type);
  } catch (error) {
    console.error("❌ Webhook signature verification failed:", error);
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    console.log("✅ Checkout session object:", session);

    const clerkId = session.metadata?.clerkId;

    if (!clerkId) {
      console.error("❌ Clerk ID is missing in session metadata:", session.metadata);
      return NextResponse.json({ error: "Missing clerk ID" }, { status: 400 });
    }

    console.log(`✅ Extracted Clerk ID: ${clerkId}`);

    try {
      console.log("⏳ Connecting to MongoDB...");
      await connect();
      console.log("✅ Connected to MongoDB");

      const updatedUser = await User.findOneAndUpdate(
        { clerkId },
        { subscription: true }, // Set subscription to true
        { new: true }
      );

      if (!updatedUser) {
        console.error(`❌ No user found with clerkId: ${clerkId}`);
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      console.log(`✅ User ${clerkId} subscription updated successfully in MongoDB`);
    } catch (err) {
      console.error("❌ MongoDB update error:", err);
      return NextResponse.json({ error: "Database update failed" }, { status: 500 });
    }
  } else {
    console.log(`ℹ️ Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}


