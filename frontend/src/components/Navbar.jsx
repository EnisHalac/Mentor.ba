import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect, useRef, useCallback } from "react";
import CreateListingModal from "./Profile/CreateListingModal"; 
import logo from "../assets/Logo.png";

export default function Navbar() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadTotal, setUnreadTotal] = useState(0);
  const [isCreateListingOpen, setIsCreateListingOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchUnread = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/chat/conversations`, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      const data = await res.json();
      if (data.ok) {
        const total = data.conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
        setUnreadTotal(total);
      }
    } catch (e) {
      console.error(e);
    }
  }, [token]);

  useEffect(() => {
    fetchUnread();
    window.addEventListener("messagesRead", fetchUnread);
    const interval = setInterval(fetchUnread, 15000);
    return () => {
      window.removeEventListener("messagesRead", fetchUnread);
      clearInterval(interval);
    };
  }, [fetchUnread]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsOpen(false);
    logout();
    navigate("/login");
  };

  const avatarUrl = user?.avatar 
    ? user.avatar 
    : `https://ui-avatars.com/api/?name=${user?.name}&background=6366f1&color=fff&bold=true`;

  return (
    <>
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
                      
            <Link to="/" className="flex items-center group">
              <img src={logo} alt="Mentor.ba" className="h-9 w-auto object-contain transition-transform duration-200 group-hover:scale-105 contrast-[1.05] mix-blend-multiply" />
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <Link to="/" className="text-gray-600 hover:text-indigo-600 font-medium transition">Home</Link>
              {user?.role === "ADMIN" && (
                <Link to="/admin" className="text-red-500 hover:text-red-700 font-bold transition underline decoration-2">Admin Panel</Link>
              )}
              {user?.role === "MENTOR" && (
                <button 
                  onClick={() => setIsCreateListingOpen(true)}
                  className="text-green-600 hover:text-green-700 font-medium transition"
                >
                  + Objavi Oglas
                </button>
              )}
            </div>

            <div className="flex items-center gap-4">
              
              <Link 
                to="/messages" 
                className="p-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors relative"
                title="Poruke"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                </svg>
                
                {unreadTotal > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                    {unreadTotal}
                  </span>
                )}
              </Link>

              <div className="hidden sm:block text-right">
                <p className="text-sm font-bold text-gray-800 leading-none">{user?.name}</p>
                <p className="text-[10px] uppercase tracking-widest text-indigo-500 font-bold mt-1">{user?.role?.name || user?.role}</p>
              </div>

              <div className="relative" ref={dropdownRef}>
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

                {isOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                    <Link 
                      to="/profile" 
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 transition font-medium"
                    >
                      Moj Profil
                    </Link>
                    
                    <Link 
                      to="/support" 
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 transition font-medium"
                    >
                      Podrška
                    </Link>

                    <Link 
                      to="/messages" 
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 transition font-medium sm:hidden"
                    >
                      Poruke
                    </Link>

                    <div className="border-t border-gray-100 my-1"></div>

                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition font-medium"
                    >
                      Odjavi se
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {isCreateListingOpen && (
        <CreateListingModal 
          onClose={() => setIsCreateListingOpen(false)}
          onCreated={() => {
            setIsCreateListingOpen(false);
            window.dispatchEvent(new Event("listingCreated"));
            navigate("/profile");
          }}
        />
      )}
    </>
  );
}