import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [sessionExpired, setSessionExpired] = useState(false);

  const clearSession = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setToken(null);
  };

  const expireSession = () => {
    clearSession();
    setSessionExpired(true);
  };

  const login = (jwtToken) => {
    localStorage.setItem("token", jwtToken);

    setToken(jwtToken);
    setSessionExpired(false);
  };

  const logout = () => {
    clearSession();
    setSessionExpired(false);
  };

  useEffect(() => {
    const handleSessionExpired = () => expireSession();

    window.addEventListener("qloudprint-session-expired", handleSessionExpired);

    return () => {
      window.removeEventListener("qloudprint-session-expired", handleSessionExpired);
    };
  }, []);

  useEffect(() => {
    if (!token) {
      return undefined;
    }

    const expiresAt = getJwtExpiryMs(token);

    if (!expiresAt || expiresAt <= Date.now()) {
      expireSession();
      return undefined;
    }

    const timeoutId = window.setTimeout(
      () => expireSession(),
      Math.max(0, expiresAt - Date.now())
    );

    return () => window.clearTimeout(timeoutId);
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        token,
        login,
        logout,
        sessionExpired,
        setSessionExpired,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

const getJwtExpiryMs = (jwtToken) => {
  try {
    const payload = jwtToken.split(".")[1];
    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(window.atob(normalizedPayload));

    return decoded.exp ? decoded.exp * 1000 : null;
  } catch {
    return null;
  }
};
