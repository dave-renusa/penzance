"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function SetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Parse access_token and refresh_token from the URL hash
    const hash = window.location.hash.slice(1);
    const params = new URLSearchParams(hash);
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");

    if (access_token && refresh_token) {
      const supabase = createClient();
      supabase.auth.setSession({ access_token, refresh_token }).then(() => {
        setReady(true);
      });
    } else {
      // No token — came here directly, just show the form (user already logged in)
      setReady(true);
    }
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords don't match."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/1500-gateway");
    }
  }

  if (!ready) return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "linear-gradient(135deg, #0c2340 0%, #0f766e 100%)" }}>
      <p style={{ color: "#fff", fontFamily: "sans-serif" }}>Loading…</p>
    </main>
  );

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "linear-gradient(135deg, #0c2340 0%, #0f766e 100%)", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 420, padding: "0 20px" }}>
        <div style={{ background: "#fff", borderRadius: 12, padding: "40px 36px", boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}>
          <div style={{ marginBottom: 32, textAlign: "center" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: "#0c2340", display: "grid", placeItems: "center" }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect x="3" y="9" width="14" height="10" rx="2" fill="#fff" />
                  <path d="M6 9V6a4 4 0 0 1 8 0v3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </div>
              <span style={{ fontSize: 15, fontWeight: 800, color: "#0c2340", letterSpacing: "-0.02em" }}>Penzance Reports</span>
            </div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#0c2340", letterSpacing: "-0.02em" }}>Set your password</h1>
            <p style={{ margin: "8px 0 0", fontSize: 14, color: "#64748b" }}>Choose a password to secure your account.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label htmlFor="password" style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 700, color: "#374151" }}>New password</label>
              <input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 8 characters"
                style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
                onFocus={e => e.target.style.borderColor = "#0c2340"} onBlur={e => e.target.style.borderColor = "#e2e8f0"} />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label htmlFor="confirm" style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 700, color: "#374151" }}>Confirm password</label>
              <input id="confirm" type="password" required value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="••••••••"
                style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
                onFocus={e => e.target.style.borderColor = "#0c2340"} onBlur={e => e.target.style.borderColor = "#e2e8f0"} />
            </div>
            {error && (
              <div style={{ marginBottom: 16, padding: "10px 12px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, fontSize: 13, color: "#b91c1c", fontWeight: 600 }}>{error}</div>
            )}
            <button type="submit" disabled={loading}
              style={{ width: "100%", padding: "11px", background: loading ? "#94a3b8" : "#0c2340", color: "#fff", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
              {loading ? "Saving…" : "Set password & sign in"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
