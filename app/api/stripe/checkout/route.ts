import { NextResponse } from "next/server";
import { getStripeClient } from "@/lib/stripe";

export async function POST() {
  const stripe = getStripeClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const priceId = process.env.STRIPE_PRO_PRICE_ID;

  if (!stripe || !priceId) {
    return NextResponse.json(
      { url: `${appUrl}/pricing?mode=demo` },
      { status: 200 },
    );
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/settings?billing=success`,
    cancel_url: `${appUrl}/pricing?billing=cancelled`,
  });

  return NextResponse.json({ url: session.url }, { status: 200 });
}
