import { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext(null); 

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);

  const setUser = (newUser) => {
    setUserState(newUser);
    if (newUser) {
      localStorage.setItem("user", JSON.stringify(newUser));
    } else {
      localStorage.removeItem("user");
    }
  };

  useEffect(() => {
    const checkUser = () => {
      try {
        const savedUser = localStorage.getItem("user");
        const token = localStorage.getItem("token");
        
        if (savedUser && token) {
          setUserState(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error("Greška pri čitanju korisnika", error);
        localStorage.removeItem("user");
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem("token", token); 
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
    window.location.href = "/login"; 
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {!loading ? children : (
        <div className="flex h-screen items-center justify-center text-xl font-bold text-gray-600">Učitavanje...</div>
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