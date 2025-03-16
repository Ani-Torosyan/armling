//test

import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-02-24.acacia",
});

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();
    
    if (!userId) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    const priceId = process.env.NEXT_PUBLIC_STRIPE_ONE_TIME_PRICE_ID;
    if (!priceId) {
      return NextResponse.json({ error: "Missing price ID" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_URL}/payments/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/payments/cancel`,
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { clerkId: userId },
    });
    

    return NextResponse.json({ url: session.url });

  } catch (error) {
    console.error("Stripe error:", error);
    return NextResponse.json({ error: "Stripe API error" }, { status: 500 });
  }
}



