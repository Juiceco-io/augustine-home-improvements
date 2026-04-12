"use client";

import { useState, useEffect, useCallback } from "react";
import { getAccessToken, signOut } from "../lib/auth";
import LoginPage from "./LoginPage";
import CMSDashboard from "./CMSDashboard";

const THEME_KEY = "cms-theme";

export default function AdminApp() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(THEME_KEY) === "dark";
  });

  const checkAuth = useCallback(async () => {
    const token = await getAccessToken();
    setIsAuthenticated(!!token);
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleLogin = () => setIsAuthenticated(true);

  const handleLogout = () => {
    signOut();
    setIsAuthenticated(false);
  };

  const handleToggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      localStorage.setItem(THEME_KEY, next ? "dark" : "light");
      return next;
    });
  };

  // Loading state while checking session
  if (isAuthenticated === null) {
    return (
      <div className={isDark ? "dark" : ""}>
        <div className="min-h-screen flex items-center justify-center dark:bg-gray-900">
          <div className="text-gray-400 dark:text-gray-500 text-sm">Loading…</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className={isDark ? "dark" : ""}>
        <LoginPage onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className={isDark ? "dark" : ""}>
      <CMSDashboard
        onLogout={handleLogout}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
      />
    </div>
  );
}
