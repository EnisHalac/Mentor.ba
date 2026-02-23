import { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext(null); 

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = () => {
      try {
        const savedUser = localStorage.getItem("user");
        const token = localStorage.getItem("token");
        
        if (savedUser && token) {
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error("Greška pri čitanju korisnika iz storage-a", error);
        localStorage.removeItem("user");
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token); 
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/login"; 
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading ? children : (
        <div className="flex h-screen items-center justify-center">Učitavanje...</div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth mora biti korišten unutar AuthProvider-a! Provjeri main.jsx.");
  }
  return context;
};