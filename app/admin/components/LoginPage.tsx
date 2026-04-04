"use client";

import { useState } from "react";
import { signIn, forgotPasswordRequest, forgotPasswordConfirm } from "../lib/auth";

interface Props {
  onLogin: () => void;
}

type View = "login" | "forgot-request" | "forgot-confirm" | "forgot-done";

export default function LoginPage({ onLogin }: Props) {
  const [view, setView] = useState<View>("login");

  // Login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Forgot-password state
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ── Login ──────────────────────────────────────────────────────────
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signIn(email, password);
      onLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  // ── Forgot – request code ──────────────────────────────────────────
  async function handleForgotRequest(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await forgotPasswordRequest(resetEmail);
      setView("forgot-confirm");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reset code");
    } finally {
      setLoading(false);
    }
  }

  // ── Forgot – confirm new password ──────────────────────────────────
  async function handleForgotConfirm(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      await forgotPasswordConfirm(resetEmail, resetCode, newPassword);
      setView("forgot-done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password");
    } finally {
      setLoading(false);
    }
  }

  function goToLogin() {
    setView("login");
    setError(null);
    setResetEmail("");
    setResetCode("");
    setNewPassword("");
    setConfirmPassword("");
  }

  // ── Shared chrome ──────────────────────────────────────────────────
  const Logo = (
    <div className="text-center mb-8">
      <div
        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
        style={{ background: "linear-gradient(135deg, #26463f, #4b776b)" }}
      >
        <span className="text-white text-2xl font-bold">A</span>
      </div>
      <h1 className="text-2xl font-bold text-gray-900">Augustine CMS</h1>
    </div>
  );

  const ErrorBox = error ? (
    <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
      {error}
    </div>
  ) : null;

  const btnStyle = {
    background: "linear-gradient(135deg, #26463f, #4b776b)",
  };

  // ── Views ──────────────────────────────────────────────────────────

  if (view === "forgot-request") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-sm">
          {Logo}
          <form
            onSubmit={handleForgotRequest}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-5"
          >
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                Reset your password
              </h2>
              <p className="text-sm text-gray-500">
                Enter your email and we&apos;ll send a verification code.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="brandon@augustinehomeimprovements.com"
                required
                autoFocus
                autoComplete="email"
              />
            </div>

            {ErrorBox}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-60"
              style={btnStyle}
            >
              {loading ? "Sending code…" : "Send Reset Code"}
            </button>

            <button
              type="button"
              onClick={goToLogin}
              className="w-full py-2 text-sm text-gray-500 hover:text-gray-700"
            >
              ← Back to sign in
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (view === "forgot-confirm") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-sm">
          {Logo}
          <form
            onSubmit={handleForgotConfirm}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-5"
          >
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                Enter new password
              </h2>
              <p className="text-sm text-gray-500">
                Check your email for the verification code sent to{" "}
                <span className="font-medium text-gray-700">{resetEmail}</span>.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Verification code
              </label>
              <input
                type="text"
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value.trim())}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent tracking-widest"
                placeholder="123456"
                required
                autoFocus
                autoComplete="one-time-code"
                inputMode="numeric"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                New password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="••••••••••••"
                required
                autoComplete="new-password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Confirm new password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="••••••••••••"
                required
                autoComplete="new-password"
              />
            </div>

            {ErrorBox}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-60"
              style={btnStyle}
            >
              {loading ? "Resetting…" : "Reset Password"}
            </button>

            <button
              type="button"
              onClick={() => {
                setView("forgot-request");
                setError(null);
              }}
              className="w-full py-2 text-sm text-gray-500 hover:text-gray-700"
            >
              ← Resend code
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (view === "forgot-done") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-sm">
          {Logo}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-5 text-center">
            <div className="text-4xl">✅</div>
            <h2 className="text-lg font-semibold text-gray-900">
              Password reset!
            </h2>
            <p className="text-sm text-gray-500">
              Your password has been updated. You can now sign in with your new
              password.
            </p>
            <button
              type="button"
              onClick={goToLogin}
              className="w-full py-3 px-4 rounded-lg text-sm font-semibold text-white transition-colors"
              style={btnStyle}
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Default: login view ────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm">
        {Logo}
        <p className="text-center text-gray-500 text-sm -mt-6 mb-8">
          Sign in to manage site content
        </p>

        <form
          onSubmit={handleLogin}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-5"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="brandon@augustinehomeimprovements.com"
              required
              autoComplete="email"
              autoFocus
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <button
                type="button"
                onClick={() => {
                  setResetEmail(email);
                  setError(null);
                  setView("forgot-request");
                }}
                className="text-xs text-green-700 hover:text-green-900 font-medium"
              >
                Forgot password?
              </button>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="••••••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          {ErrorBox}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-60"
            style={btnStyle}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
