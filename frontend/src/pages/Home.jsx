import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import apiClient from "../api/apiClient";

export default function Home() {
  const { user, logout } = useAuth();
  const [listings, setListings] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const getListings = async () => {
      try {
        const response = await apiClient.get("/listings");
        setListings(response.data);
      } catch (err) {
        setError("Ne mogu učitati oglase.");
      }
    };
    getListings();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="bg-white p-6 rounded-lg shadow-md mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Zdravo, {user?.name}!</h1>
          <p className="text-gray-600">
            Tvoja uloga: <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-bold">{user?.role}</span>
          </p>
        </div>
        <button 
          onClick={logout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
        >
          Odjavi se
        </button>
      </div>

      <h2 className="text-xl font-semibold mb-4 text-gray-700">Aktivni oglasi ({listings.length})</h2>
      
      {error && <p className="text-red-500">{error}</p>}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {listings.map((item) => (
          <div key={item.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition">
            <h3 className="text-lg font-bold text-blue-600">{item.title}</h3>
            <p className="text-gray-600 my-2">{item.description}</p>
            <div className="flex justify-between items-center mt-4">
              <span className="text-green-600 font-bold">{item.price} KM</span>
              <span className="text-xs text-gray-400">Mentor: {item.author?.name}</span>
            </div>
          </div>
        ))}
        {listings.length === 0 && !error && (
          <p className="text-gray-500 italic text-center col-span-3 py-10">Trenutno nema objavljenih oglasa.</p>
        )}
      </div>
    </div>
  );
}