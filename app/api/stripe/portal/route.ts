import { NextResponse } from "next/server";
import { getStripeClient } from "@/lib/stripe";

export async function POST() {
  const stripe = getStripeClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe keys missing. Portal unavailable in demo mode." },
      { status: 400 },
    );
  }

  const customerId = process.env.STRIPE_DEFAULT_CUSTOMER_ID;
  if (!customerId) {
    return NextResponse.json(
      { error: "No customer mapped yet. Add STRIPE_DEFAULT_CUSTOMER_ID." },
      { status: 400 },
    );
  }

  const portal = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${appUrl}/settings`,
  });

  return NextResponse.json({ url: portal.url }, { status: 200 });
}
