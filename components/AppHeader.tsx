"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { AppBar, Box, Button, Stack, Toolbar, Typography } from "@mui/material";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import WbSunnyRoundedIcon from "@mui/icons-material/WbSunnyRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import { useThemeMode } from "@/components/providers/AppProviders";

export function AppHeader() {
  const { mode, toggleMode } = useThemeMode();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const navSx = (href: string) => ({
    borderBottom: pathname === href ? "2px solid" : "2px solid transparent",
    borderRadius: 0,
    borderColor: pathname === href ? "primary.main" : "transparent",
    color: pathname === href ? "primary.main" : "text.primary",
    fontWeight: pathname === href ? 700 : 500,
  });

  return (
    <AppBar position="static" color="transparent" elevation={0}>
      <Toolbar className="mx-auto w-full max-w-6xl flex-wrap gap-2 px-3 py-2 sm:px-6">
        <Typography
          variant="h6"
          sx={{
            fontWeight: 800,
            flexGrow: 1,
            fontSize: { xs: "1.25rem", md: "1.1rem" },
            letterSpacing: 0.2,
          }}
        >
          AI SaaS Chat
        </Typography>
        <Stack direction="row" spacing={1} sx={{ display: { xs: "none", md: "flex" } }}>
          <Button component={Link} href="/" sx={navSx("/")}>
            Home
          </Button>
          <Button component={Link} href="/pricing" sx={navSx("/pricing")}>
            Pricing
          </Button>
          <Button component={Link} href="/chat" sx={navSx("/chat")}>
            Chat
          </Button>
          <Button component={Link} href="/dashboard" sx={navSx("/dashboard")}>
            Dashboard
          </Button>
          <Button component={Link} href="/settings" sx={navSx("/settings")}>
            Settings
          </Button>
          <Button component={Link} href="/auth" variant="contained">
            Sign In
          </Button>
          <Button component={Link} href="/signup" variant="outlined">
            Sign Up
          </Button>
          <Button onClick={toggleMode} color="inherit">
            <Box className="flex items-center gap-1">
              {mode === "light" ? <DarkModeRoundedIcon /> : <WbSunnyRoundedIcon />}
            </Box>
          </Button>
        </Stack>

        <Stack direction="row" spacing={0.5} sx={{ display: { xs: "flex", md: "none" } }}>
          <Button onClick={() => setOpen((previous) => !previous)} color="inherit">
            <MenuRoundedIcon />
          </Button>
          <Button onClick={toggleMode} color="inherit">
            {mode === "light" ? <DarkModeRoundedIcon /> : <WbSunnyRoundedIcon />}
          </Button>
        </Stack>

        {open ? (
          <Stack
            direction="column"
            spacing={1}
            className="w-full pb-1"
            sx={{ display: { xs: "flex", md: "none" } }}
          >
            <Button
              component={Link}
              href="/"
              onClick={() => setOpen(false)}
              fullWidth
              sx={{
                justifyContent: "flex-start",
                fontWeight: 600,
                bgcolor: pathname === "/" ? "primary.main" : "transparent",
                color: pathname === "/" ? "primary.contrastText" : "text.primary",
              }}
            >
              Home
            </Button>
            <Button
              component={Link}
              href="/pricing"
              onClick={() => setOpen(false)}
              fullWidth
              sx={{
                justifyContent: "flex-start",
                fontWeight: 600,
                bgcolor: pathname === "/pricing" ? "primary.main" : "transparent",
                color:
                  pathname === "/pricing" ? "primary.contrastText" : "text.primary",
              }}
            >
              Pricing
            </Button>
            <Button
              component={Link}
              href="/chat"
              onClick={() => setOpen(false)}
              fullWidth
              sx={{
                justifyContent: "flex-start",
                fontWeight: 600,
                bgcolor: pathname === "/chat" ? "primary.main" : "transparent",
                color: pathname === "/chat" ? "primary.contrastText" : "text.primary",
              }}
            >
              Chat
            </Button>
            <Button
              component={Link}
              href="/dashboard"
              onClick={() => setOpen(false)}
              fullWidth
              sx={{
                justifyContent: "flex-start",
                fontWeight: 600,
                bgcolor: pathname === "/dashboard" ? "primary.main" : "transparent",
                color:
                  pathname === "/dashboard"
                    ? "primary.contrastText"
                    : "text.primary",
              }}
            >
              Dashboard
            </Button>
            <Button
              component={Link}
              href="/settings"
              onClick={() => setOpen(false)}
              fullWidth
              sx={{
                justifyContent: "flex-start",
                fontWeight: 600,
                bgcolor: pathname === "/settings" ? "primary.main" : "transparent",
                color:
                  pathname === "/settings" ? "primary.contrastText" : "text.primary",
              }}
            >
              Settings
            </Button>
            <Button
              component={Link}
              href="/auth"
              variant="contained"
              onClick={() => setOpen(false)}
              fullWidth
              sx={{ justifyContent: "flex-start", fontWeight: 700 }}
            >
              Sign In
            </Button>
            <Button
              component={Link}
              href="/signup"
              variant="outlined"
              onClick={() => setOpen(false)}
              fullWidth
              sx={{ justifyContent: "flex-start", fontWeight: 700 }}
            >
              Sign Up
            </Button>
          </Stack>
        ) : null}
      </Toolbar>
    </AppBar>
  );
}
