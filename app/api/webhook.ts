//test

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
    event = stripe.webhooks.constructEvent(
      await req.text(),
      sig,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const clerkId = session.metadata?.clerkId; // ✅ Retrieve clerkId from metadata

    if (clerkId) {
      try {
        await connect(); // ✅ Ensure MongoDB is connected

        // ✅ Update subscription status in the User model
        await User.findOneAndUpdate(
          { clerkId },
          { subscription: true }, // Set subscription to true
          { new: true }
        );

        console.log(`✅ User ${clerkId} subscription updated in MongoDB`);
      } catch (err) {
        console.error("MongoDB update error:", err);
      }
    }
  }

  return NextResponse.json({ received: true });
}

