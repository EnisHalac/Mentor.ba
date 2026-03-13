import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Register from "./pages/Register";
import Login from "./pages/Login"; 
import Home from "./pages/Home";

function App() {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex h-screen items-center justify-center text-2xl font-bold">Učitavanje...</div>;

  return (
    <Router>
      <Routes>
        
        <Route path="/" element={user ? <Home /> : <Navigate to="/Login" />} />
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;