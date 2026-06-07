import { createContext, useState } from "react";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  const login = (jwtToken) => {
    localStorage.setItem("token", jwtToken);

    setToken(jwtToken);
  };

  const logout = () => {
    localStorage.removeItem("token");

    localStorage.removeItem("role");

    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
