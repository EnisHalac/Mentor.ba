import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const avatarUrl = user?.avatar 
    ? user.avatar 
    : `https://ui-avatars.com/api/?name=${user?.name}&background=6366f1&color=fff&bold=true`;

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
                    
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-black text-indigo-600 tracking-tighter">MENTOR.BA</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-gray-600 hover:text-indigo-600 font-medium transition">Home</Link>
            {user?.role === "ADMIN" && (
              <Link to="/admin" className="text-red-500 hover:text-red-700 font-bold transition underline decoration-2">Admin Panel</Link>
            )}
            {user?.role === "MENTOR" && (
              <Link to="/create-listing" className="text-green-600 hover:text-green-700 font-medium transition">+ Objavi Oglas</Link>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-bold text-gray-800 leading-none">{user?.name}</p>
              <p className="text-[10px] uppercase tracking-widest text-indigo-500 font-bold mt-1">{user?.role?.name || user?.role}</p>
            </div>

            <div className="relative group">
              <button 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center focus:outline-none"
              >
                <img 
                  src={avatarUrl} 
                  alt="Profile" 
                  className="w-10 h-10 rounded-full border-2 border-indigo-50 hover:border-indigo-400 transition-all object-cover"
                />
              </button>

              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 opacity-0 group-hover:opacity-100 transition-all pointer-events-none group-hover:pointer-events-auto">
                <Link to="/profile" className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 transition font-medium">Moj Profil</Link>
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition font-medium"
                >
                  Odjavi se
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </nav>
  );
}