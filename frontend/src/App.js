import { useState, useEffect } from "react";
import { api, getToken, setToken, clearToken } from "./services/api";
import AuthScreen from "./components/AuthScreen";
import Dashboard from "./components/Dashboard";
import LandingPage from "./components/LandingPage";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    if (!getToken()) { setLoading(false); return; }
    api.me().then(setUser).catch(() => clearToken()).finally(() => setLoading(false));
  }, []);

  const onAuthed = async (token) => {
    setToken(token);
    const u = await api.me();
    setUser(u);
    setShowAuth(false);
  };

  const logout = () => { clearToken(); setUser(null); setShowAuth(false); };

  if (loading) return <div style={S.boot}>Kryx…</div>;
  if (user) return <Dashboard user={user} onLogout={logout} />;
  if (showAuth) return <AuthScreen onAuthed={onAuthed} onBack={() => setShowAuth(false)} />;
  return <LandingPage onGetStarted={() => setShowAuth(true)} />;
}

const S = {
  boot: { minHeight: "100vh", display: "grid", placeItems: "center", background: "#080810", color: "#46E5FF", fontFamily: "monospace", fontSize: 20 },
};
