"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError("Invalid email or password.");
      setLoading(false);
    } else {
      router.push("/1500-gateway");
      router.refresh();
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "linear-gradient(135deg, #0c2340 0%, #0f766e 100%)",
        fontFamily:
          "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          padding: "0 20px",
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            padding: "40px 36px",
            boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
          }}
        >
          <div style={{ marginBottom: 32, textAlign: "center" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: "#0c2340",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect x="3" y="9" width="14" height="10" rx="2" fill="#fff" />
                  <path
                    d="M6 9V6a4 4 0 0 1 8 0v3"
                    stroke="#fff"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 800,
                  color: "#0c2340",
                  letterSpacing: "-0.02em",
                }}
              >
                Penzance Reports
              </span>
            </div>
            <h1
              style={{
                margin: 0,
                fontSize: 22,
                fontWeight: 800,
                color: "#0c2340",
                letterSpacing: "-0.02em",
              }}
            >
              Sign in
            </h1>
            <p
              style={{
                margin: "8px 0 0",
                fontSize: 14,
                color: "#64748b",
              }}
            >
              Access is restricted. Contact your administrator for access.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label
                htmlFor="email"
                style={{
                  display: "block",
                  marginBottom: 6,
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#374151",
                }}
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1.5px solid #e2e8f0",
                  borderRadius: 8,
                  fontSize: 14,
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 0.15s",
                  fontFamily: "inherit",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#0c2340")}
                onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label
                htmlFor="password"
                style={{
                  display: "block",
                  marginBottom: 6,
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#374151",
                }}
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1.5px solid #e2e8f0",
                  borderRadius: 8,
                  fontSize: 14,
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 0.15s",
                  fontFamily: "inherit",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#0c2340")}
                onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
              />
            </div>

            {error && (
              <div
                style={{
                  marginBottom: 16,
                  padding: "10px 12px",
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: 8,
                  fontSize: 13,
                  color: "#b91c1c",
                  fontWeight: 600,
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "11px",
                background: loading ? "#94a3b8" : "#0c2340",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontSize: 15,
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                transition: "background 0.15s",
                fontFamily: "inherit",
              }}
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
