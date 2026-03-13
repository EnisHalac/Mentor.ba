import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Register from "./pages/Register";
import Login from "./pages/Login"; 
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex h-screen items-center justify-center">Učitavanje...</div>;

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />

        <Route path="/" element={user ? <Home /> : <Navigate to="/login" />} />
        <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
        
        <Route 
          path="/admin" 
          element={user?.role === "ADMIN" ? <AdminDashboard /> : <Navigate to="/" />} 
        />
      </Routes>
    </Router>
  );
}

export default App;