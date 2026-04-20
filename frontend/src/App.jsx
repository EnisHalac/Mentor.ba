import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Register from "./pages/Register";
import Login from "./pages/Login"; 
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import ManageListing from "./pages/ManageListing";
import ListingDetails from "./pages/ListigDetails";
import Messages from "./pages/Messages";
import Support from "./pages/Suport";

function App() {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex h-screen items-center justify-center text-2xl font-bold">Učitavanje...</div>;

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
        <Route path="/" element={user ? (user.role === "ADMIN" ? <Navigate to ="/admin"/> : <Home />) : <Navigate to="/login" />} />
        <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
        <Route path="/messages" element={user ? <Messages /> : <Navigate to="/login" />} />
        <Route path="/admin" element={user?.role === "ADMIN" ? <AdminDashboard /> : <Navigate to="/" />}/>
        <Route path="/listings/:id" element={<ListingDetails />} />
        <Route path="/manage-listing/:id" element={<ManageListing />} />
        <Route path="/support" element={user ? <Support /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;