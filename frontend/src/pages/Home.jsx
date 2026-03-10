import { useEffect, useState } from "react";
import apiClient from "../api/apiClient";
import Navbar from "../components/Navbar";

export default function Home() {
  const [listings, setListings] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const getListings = async () => {
      try {
        const response = await apiClient.get("/listings");
        setListings(response.data);
      } catch (err) {
        setError("Error fetching listings. Please try again later.");
      }
    };
    getListings();
  }, []);

  return (
    <div className="min-h-screen bg-[#fcfcfd]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-10">
        <header className="mb-10">
          <h1 className="text-4xl font-black text-gray-900 mb-2">Pronađi mentora 🎓</h1>
          <p className="text-gray-500 text-lg">Pregledaj dostupne instrukcije i unaprijedi svoje znanje.</p>
        </header>
        
        {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6">{error}</div>}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {listings.map((item) => (
            <div key={item.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  {item.category || "General"}
                </span>
                <span className="text-2xl font-black text-gray-900">{item.price} KM<span className="text-xs text-gray-400 font-normal">/h</span></span>
              </div>
              
              <h3 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h3>
              <p className="text-gray-500 text-sm line-clamp-3 mb-6">{item.description}</p>
              
              <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                <img 
                  src={`https://ui-avatars.com/api/?name=${item.author?.name}&background=random`} 
                  className="w-8 h-8 rounded-full" 
                />
                <span className="text-sm font-semibold text-gray-700">{item.author?.name}</span>
              </div>
            </div>
          ))}
        </div>

        {listings.length === 0 && !error && (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
            <p className="text-gray-400 text-lg italic">Trenutno nema objavljenih oglasa.</p>
          </div>
        )}
      </main>
    </div>
  );
}