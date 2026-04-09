"use client";

import { useState } from "react";
import { Alert, Button, Paper, Stack, Typography } from "@mui/material";
import axios from "axios";

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Good for getting started",
    features: ["Basic AI chat", "Limited usage", "Community support"],
    cta: "Current Plan",
    disabled: true,
  },
  {
    name: "Pro",
    price: "$19/mo",
    description: "For power users and teams",
    features: [
      "Priority responses",
      "Higher usage limits",
      "Stripe-managed billing",
      "Advanced dashboard",
    ],
    cta: "Upgrade to Pro",
    disabled: false,
  },
];

export default function PricingPage() {
  const [error, setError] = useState("");

  const onUpgrade = async () => {
    setError("");
    try {
      const response = await axios.post<{ url: string }>("/api/stripe/checkout");
      window.location.href = response.data.url;
    } catch {
      setError("Unable to start checkout right now.");
    }
  };

  return (
    <main className="mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-6xl flex-col px-4 py-10">
      <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
        Simple pricing
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Start free and upgrade to Pro when you are ready.
      </Typography>
      {error ? <Alert severity="error">{error}</Alert> : null}
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {plans.map((plan) => (
          <Paper
            key={plan.name}
            className="rounded-2xl p-6 text-slate-900 dark:text-slate-100"
            elevation={2}
          >
            <Stack spacing={1}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {plan.name}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                {plan.price}
              </Typography>
              <Typography color="text.secondary">{plan.description}</Typography>
              <ul className="my-2 list-inside list-disc space-y-1 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <Button
                variant="contained"
                disabled={plan.disabled}
                onClick={() => void onUpgrade()}
              >
                {plan.cta}
              </Button>
            </Stack>
          </Paper>
        ))}
      </div>
    </main>
  );
}
