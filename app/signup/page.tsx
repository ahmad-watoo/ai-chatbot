"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Alert, Box, Button, Paper, Stack, TextField, Typography } from "@mui/material";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setInfo("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const { error: authError } = await supabaseBrowser.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (authError) {
      setError(authError.message);
      return;
    }

    setInfo("Account created. Check your email for the confirmation link.");
    setFullName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <main className="mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-md items-center px-4 py-10">
      <Paper className="w-full rounded-2xl p-6 text-slate-900 dark:text-slate-100" elevation={2}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          Create your account
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Sign up with Supabase. Your account will be stored in Supabase Auth and
          synced to your `profiles` table.
        </Typography>

        <Box component="form" onSubmit={(event) => void onSubmit(event)}>
          <Stack spacing={2}>
            {error ? <Alert severity="error">{error}</Alert> : null}
            {info ? <Alert severity="success">{info}</Alert> : null}

            <TextField
              label="Full Name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              fullWidth
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              fullWidth
            />
            <TextField
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              fullWidth
            />

            <Button type="submit" variant="contained">
              Create Account
            </Button>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{" "}
              <Button component={Link} href="/auth" variant="text" sx={{ p: 0, minWidth: 0 }}>
                Sign in
              </Button>
            </Typography>
          </Stack>
        </Box>
      </Paper>
    </main>
  );
}
