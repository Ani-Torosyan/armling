import Stripe from "stripe";
import { connect } from "@/db";
import User from "@/modals/user.modal";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-02-24.acacia",
});

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature") as string;
  let event;

  try {
    const rawBody = await req.text();
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (error) {
    return NextResponse.json({ error: "Webhook verification failed" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const clerkId = session.metadata?.clerkId;

    if (!clerkId) {
      return NextResponse.json({ error: "Missing clerk ID" }, { status: 400 });
    }

    try {
      await connect();
      await User.findOneAndUpdate(
        { clerkId },
        { subscription: true },
        { new: true }
      );
    } catch (err) {
      return NextResponse.json({ error: "Database update failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
