import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Register from "./pages/register";
import Login from "./pages/Login"; 

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<h1>Home - Platforma za Znanje</h1>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;