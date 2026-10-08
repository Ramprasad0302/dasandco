import { useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowLeft,
} from "lucide-react";
import dasCoLogo from "@/assets/das-co-logo-full.png";
import { API } from "@/lib/api";

// =====================================
// ROUTE
// =====================================

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

// =====================================
// AUTH PAGE
// =====================================

function AuthPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  // =====================================
  // LOGIN
  // =====================================

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setBusy(true);
    setError("");

    try {
      const response = await fetch(`${API}/auth/login`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },

        credentials: "include",

        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      // =====================================
      // READ RESPONSE SAFELY
      // =====================================

      const contentType = response.headers.get("content-type") || "";

      let data: any = {};

      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();

        data = {
          message: text || "Unexpected response from backend.",
        };
      }

      // =====================================
      // LOGIN FAILED
      // =====================================

      if (!response.ok) {
        setError(
          data?.message ||
            data?.error ||
            `Login failed (${response.status}).`
        );

        return;
      }

      // =====================================
      // CHECK TOKEN
      // =====================================

      if (!data?.token) {
        console.error("Login response did not contain a token:", data);

        setError("Login succeeded, but no authentication token was returned.");

        return;
      }

      // =====================================
      // SAVE LOGIN DATA
      // =====================================

      localStorage.setItem("token", data.token);

      if (data.user) {
        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );
      }

      // =====================================
      // GO TO DASHBOARD
      // =====================================

      navigate({
        to: "/dashboard",
        replace: true,
      });
    } catch (err) {
      console.error("LOGIN ERROR:", err);

      setError(
        "Unable to connect to backend. Please check that the API server is running."
      );
    } finally {
      setBusy(false);
    }
  };

  // =====================================
  // UI
  // =====================================

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0b0b0b] px-4">

      {/* =====================================
          BACKGROUND GLOW
      ===================================== */}

      <div className="absolute inset-0 pointer-events-none">

        <div
          className="
            absolute
            left-0
            top-0
            h-[450px]
            w-[450px]
            rounded-full
            bg-yellow-500/10
            blur-[180px]
          "
        />

        <div
          className="
            absolute
            bottom-0
            right-0
            h-[500px]
            w-[500px]
            rounded-full
            bg-yellow-400/5
            blur-[220px]
          "
        />

      </div>

      {/* =====================================
          LOGIN CARD
      ===================================== */}

      <motion.div
        initial={{
          opacity: 0,
          y: 40,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.6,
        }}
        className="
          relative
          z-10
          w-full
          max-w-md
          rounded-3xl
          border
          border-gold/20
          bg-[#171717]/90
          p-10
          shadow-[0_20px_80px_rgba(0,0,0,0.5)]
          backdrop-blur-xl
        "
      >

        {/* =====================================
            LOGO / TITLE
        ===================================== */}

        <div className="mb-10 text-center">

          <img src={dasCoLogo} alt="DAS & CO" className="mx-auto mb-4 h-24 w-24 object-contain" />

          <h1 className="text-4xl font-bold tracking-wide text-white">
            DAS <span className="text-gold">&amp;</span> CO
          </h1>

          <p className="mt-3 text-sm uppercase tracking-[0.25em] text-text-muted">
            Business Management System
          </p>

          <a href="tel:9390673813" className="mt-2 inline-block text-xs text-text-muted hover:text-gold">
            9390673813
          </a>

        </div>

        {/* =====================================
            LOGIN FORM
        ===================================== */}

        <form
          onSubmit={onSubmit}
          className="space-y-5"
        >

          {/* =====================================
              EMAIL
          ===================================== */}

          <div>

            <label className="mb-2 block text-sm text-text-muted">
              Email Address
            </label>

            <div className="relative">

              <Mail
                size={18}
                className="
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  text-gold
                "
              />

              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="
                  w-full
                  rounded-2xl
                  border
                  border-gold/20
                  bg-black/20
                  py-4
                  pl-12
                  pr-4
                  text-white
                  outline-none
                  transition
                  placeholder:text-gray-600
                  focus:border-gold
                "
              />

            </div>

          </div>

          {/* =====================================
              PASSWORD
          ===================================== */}

          <div>

            <label className="mb-2 block text-sm text-text-muted">
              Password
            </label>

            <div className="relative">

              <Lock
                size={18}
                className="
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  text-gold
                "
              />

              <input
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="
                  w-full
                  rounded-2xl
                  border
                  border-gold/20
                  bg-black/20
                  py-4
                  pl-12
                  pr-12
                  text-white
                  outline-none
                  transition
                  placeholder:text-gray-600
                  focus:border-gold
                "
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="
                  absolute
                  right-4
                  top-1/2
                  -translate-y-1/2
                  text-gold
                  transition
                  hover:text-yellow-300
                "
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>

            </div>

          </div>

          {/* =====================================
              ERROR MESSAGE
          ===================================== */}

          {error && (
            <div
              className="
                rounded-xl
                border
                border-red-500/30
                bg-red-500/10
                p-3
                text-sm
                text-red-400
              "
            >
              {error}
            </div>
          )}

          {/* =====================================
              SIGN IN BUTTON
          ===================================== */}

          <button
            type="submit"
            disabled={busy}
            className="
              w-full
              rounded-2xl
              bg-gradient-to-r
              from-yellow-500
              via-yellow-400
              to-yellow-300
              py-4
              font-semibold
              text-black
              transition-all
              duration-300
              hover:scale-[1.02]
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {busy ? "Signing In..." : "Sign In"}
          </button>

        </form>

        {/* =====================================
            BACK TO WEBSITE
        ===================================== */}

        <div className="mt-8 flex justify-center">

          <Link
            to="/"
            className="
              flex
              items-center
              gap-2
              text-sm
              text-text-muted
              transition
              hover:text-gold
            "
          >
            <ArrowLeft size={16} />
            Back to Website
          </Link>

        </div>

      </motion.div>

    </div>
  );
}