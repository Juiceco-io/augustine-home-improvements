import { useState, useEffect, useCallback } from "react";
import { getAccessToken, signOut } from "./lib/auth";
import LoginPage from "./pages/LoginPage";
import CMSDashboard from "./pages/CMSDashboard";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

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

  // Loading state while checking session
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading…</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return <CMSDashboard onLogout={handleLogout} />;
}
