import { createContext, useContext, useEffect, useState, useMemo } from "react";

const AuthContext = createContext(null);

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000; // 7 days (1 week)

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    const saved = localStorage.getItem("lc_token") || "";
    const loginTime = Number(localStorage.getItem("lc_login_time") || 0);
    if (saved && loginTime && Date.now() - loginTime > ONE_WEEK_MS) {
      localStorage.removeItem("lc_token");
      localStorage.removeItem("lc_user");
      localStorage.removeItem("lc_login_time");
      return "";
    }
    return saved;
  });

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("lc_user");
      const loginTime = Number(localStorage.getItem("lc_login_time") || 0);
      if (saved && loginTime && Date.now() - loginTime > ONE_WEEK_MS) {
        return null;
      }
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Sync token to localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem("lc_token", token);
    } else {
      localStorage.removeItem("lc_token");
      localStorage.removeItem("lc_user");
      localStorage.removeItem("lc_login_time");
    }
  }, [token]);

  // Sync user to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem("lc_user", JSON.stringify(user));
    }
  }, [user]);

  // Verify token on mount (auto-logout if 1 week has passed)
  useEffect(() => {
    const verifyUser = async () => {
      if (!token) {
        setIsLoadingAuth(false);
        return;
      }

      const loginTime = Number(localStorage.getItem("lc_login_time") || 0);
      if (loginTime && Date.now() - loginTime > ONE_WEEK_MS) {
        setToken("");
        setUser(null);
        localStorage.removeItem("lc_token");
        localStorage.removeItem("lc_user");
        localStorage.removeItem("lc_login_time");
        setIsLoadingAuth(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          // Token expired or invalid
          setToken("");
          setUser(null);
          localStorage.removeItem("lc_login_time");
        }
      } catch (err) {
        console.error("Auth verification failed:", err);
      } finally {
        setIsLoadingAuth(false);
      }
    };

    verifyUser();
  }, [token]);

  const loginWithGoogle = async (credential) => {
    try {
      const res = await fetch(`${API_BASE}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to authenticate with Google");
      }

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("lc_login_time", Date.now().toString());
      return data;
    } catch (error) {
      console.error("Google login error:", error);
      throw error;
    }
  };

  const logout = () => {
    setToken("");
    setUser(null);
    localStorage.removeItem("lc_token");
    localStorage.removeItem("lc_user");
    localStorage.removeItem("lc_login_time");
  };

  const authHeader = useMemo(() => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [token]);

  const value = {
    user,
    token,
    isLoadingAuth,
    loginWithGoogle,
    logout,
    authHeader,
    isAuthenticated: Boolean(user && token)
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
