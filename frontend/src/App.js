import { useState, useEffect } from "react";
import { api, getToken, setToken, clearToken } from "./services/api";
import AuthScreen from "./components/AuthScreen";
import Dashboard from "./components/Dashboard";
import LandingPage from "./components/LandingPage";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showApp, setShowApp] = useState(false);

  useEffect(() => {
    if (!getToken()) { setLoading(false); return; }
    api.me().then(setUser).catch(() => clearToken()).finally(() => setLoading(false));
  }, []);

  const onAuthed = async (token) => {
    setToken(token);
    const u = await api.me();
    setUser(u);
  };

  const logout = () => { clearToken(); setUser(null); setShowApp(false); };

  if (loading) return <div style={S.boot}>Kryx…</div>;
  if (user) return <Dashboard user={user} onLogout={logout} />;
  if (showApp) return <AuthScreen onAuthed={onAuthed} onBack={() => setShowApp(false)} />;
  return <LandingPage onEnter={() => setShowApp(true)} />;
}

const S = {
  boot: { minHeight: "100vh", display: "grid", placeItems: "center", background: "#080810", color: "#46E5FF", fontFamily: "monospace", fontSize: 20 },
};
