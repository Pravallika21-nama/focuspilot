import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { fetchProfileRequest, googleLoginRequest, loginRequest, registerRequest } from "../services/api.js";
import { signInWithGoogle } from "../services/firebase.js";
import { requestNotificationPermission } from "../services/notifications.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("study_user") || "null"));
  const [authChecking, setAuthChecking] = useState(Boolean(localStorage.getItem("study_token")));

  useEffect(() => {
    const token = localStorage.getItem("study_token");
    if (!token) {
      setAuthChecking(false);
      return;
    }

    fetchProfileRequest()
      .then((data) => {
        localStorage.setItem("study_user", JSON.stringify(data.user));
        setUser(data.user);
      })
      .catch(() => {
        localStorage.removeItem("study_token");
        localStorage.removeItem("study_user");
        setUser(null);
      })
      .finally(() => setAuthChecking(false));
  }, []);

  async function login(payload) {
    const data = await loginRequest(payload);
    localStorage.setItem("study_token", data.token);
    localStorage.setItem("study_user", JSON.stringify(data.user));
    setUser(data.user);
    requestNotificationPermission();
  }

  async function register(payload) {
    const data = await registerRequest(payload);
    localStorage.setItem("study_token", data.token);
    localStorage.setItem("study_user", JSON.stringify(data.user));
    setUser(data.user);
    requestNotificationPermission();
  }

  async function loginWithGoogle() {
    const google = await signInWithGoogle();
    const data = await googleLoginRequest(google);
    localStorage.setItem("study_token", data.token);
    localStorage.setItem("study_user", JSON.stringify(data.user));
    setUser(data.user);
    requestNotificationPermission();
  }

  function logout() {
    localStorage.removeItem("study_token");
    localStorage.removeItem("study_user");
    setUser(null);
  }

  const value = useMemo(
    () => ({ user, authChecking, login, register, loginWithGoogle, logout, setUser }),
    [user, authChecking]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
