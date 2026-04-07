import { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext(null); 

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const setUser = (newUser) => {
    setUserState(newUser);
    if (newUser) {
      localStorage.setItem("user", JSON.stringify(newUser));
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setToken(null);
    }
  };

  useEffect(() => {
    const checkUser = () => {
      try {
        const savedUser = localStorage.getItem("user");
        const savedToken = localStorage.getItem("token");
        
        if (savedUser && savedToken) {
          setUserState(JSON.parse(savedUser));
          setToken(savedToken);
        }
      } catch (error) {
        console.error("Error reading auth data", error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  const login = (userData, userToken) => {
    setUserState(userData);
    setToken(userToken);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", userToken); 
  };

  const logout = () => {
    setUserState(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/login"; 
  };

  return (
    <AuthContext.Provider value={{ user, token, setUser, login, logout, loading }}>
      {!loading ? children : (
        <div className="flex h-screen items-center justify-center text-xl font-bold text-gray-600">Loading...</div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};