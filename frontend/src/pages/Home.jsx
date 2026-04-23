import { useEffect, useState } from "react";
import apiClient from "../api/apiClient";
import Navbar from "../components/Navbar";
import UserNotifications from "../components/UserNotifications";
import FilterModal from "../components/Home/FilterModal";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [listings, setListings] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState("");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    search: "",
    category: "",
    minPrice: "",
    maxPrice: "",
    minRating: "",
    mode: "",
    location: "",
    sortBy: "date_desc"
  });

  useEffect(() => {
    const getListings = async () => {
      try {
        const response = await apiClient.get("/listings", { params: activeFilters });
        setListings(response.data);
      } catch (err) {
        setError("Error fetching listings. Please try again later.");
      }
    };
    getListings();
  }, [activeFilters]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setActiveFilters(prev => ({ ...prev, search: searchInput }));
  };

  const handleApplyFilters = (newFilters) => {
    setActiveFilters(prev => ({ ...prev, ...newFilters }));
  };

  const renderModeBadge = (mode, location) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm w-fit";
    if (mode === "ONLINE") return <span className={`bg-blue-50 text-blue-600 ${baseClasses}`}>Online</span>;
    if (mode === "ONSITE") return <span className={`bg-orange-50 text-orange-600 ${baseClasses}`}>Uživo {location && `(${location})`}</span>;
    if (mode === "HYBRID") return <span className={`bg-emerald-50 text-emerald-600 ${baseClasses}`}>Hybrid {location && `(${location})`}</span>;
    return null;
  };

  const hasActiveFilters = activeFilters.category || activeFilters.minPrice || activeFilters.maxPrice || activeFilters.minRating || activeFilters.mode || activeFilters.location;

  return (
    <div className="min-h-screen bg-[#fcfcfd]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-10">
        <UserNotifications />

      <header className="mb-12 mt-8 flex flex-col items-center text-center">
        <h1 className="text-4xl font-black text-gray-900 mb-2">Pronađi mentora</h1>
        <p className="text-gray-500 text-lg mb-8 max-w-2xl">Pregledaj dostupne instrukcije i unaprijedi svoje znanje.</p>
        
        <div className="flex flex-col lg:flex-row gap-3 w-full max-w-5xl justify-center">
          
          <form onSubmit={handleSearchSubmit} className="flex flex-1 gap-3">
            <div className="relative flex-1 text-left">
              <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </span>
              <input 
                type="text" 
                placeholder="Pretraži (npr. Java, React)..." 
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-11 pr-4 py-4 rounded-2xl bg-white border border-gray-200 shadow-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition text-gray-700 font-medium"
              />
            </div>
            <button type="submit" className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition shadow-sm">
              Traži
            </button>
          </form>

          <div className="flex gap-3 text-left">
            <button 
              type="button" 
              onClick={() => setIsFilterModalOpen(true)} 
              className="w-32 bg-white border border-gray-200 text-gray-700 px-4 py-4 rounded-2xl font-bold hover:bg-gray-50 transition shadow-sm flex items-center justify-center gap-2 relative"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
              </svg>
              Filteri
              {hasActiveFilters && (
                <span className="absolute top-4 right-4 bg-red-500 w-2.5 h-2.5 rounded-full block shadow-sm border border-white"></span>
              )}
            </button>

            <div className="relative w-48">
              <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
                </svg>
              </span>
              <select 
                value={activeFilters.sortBy}
                onChange={(e) => setActiveFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                className="w-full bg-white border border-gray-200 text-gray-700 pl-11 pr-10 py-4 rounded-2xl font-bold hover:bg-gray-50 shadow-sm focus:outline-none transition cursor-pointer appearance-none truncate"
              >
                <option value="date_desc">Najnovije</option>
                <option value="date_asc">Najstarije</option>
                <option value="price_asc">Najjeftinije</option>
                <option value="price_desc">Najskuplje</option>
                <option value="rating_desc">Najbolje ocjene</option>
              </select>
              <span className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </span>
            </div>

          </div>
        </div>
      </header>
        {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6">{error}</div>}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {listings.map((item) => {
            const avatarUrl = item.author?.avatar 
              ? item.author.avatar 
              : `https://ui-avatars.com/api/?name=${item.author?.name || 'Mentor'}&background=6366f1&color=fff&bold=true`;

            const averageRating = item.avgRating > 0 ? item.avgRating.toFixed(1) : 0;

            return (
              <div key={item.id} 
                onClick={() => navigate(`/listings/${item.id}`)}
                className="relative bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-[300px]">
                
                <div className="absolute bottom-5 right-5 z-10 flex flex-col items-end gap-2">
                  <div className="bg-white/90 backdrop-blur shadow-sm px-2.5 py-1 rounded-full flex items-center gap-1 border border-gray-100 w-fit">
                    <svg className={`w-4 h-4 ${averageRating > 0 ? "text-yellow-400" : "text-gray-300"} fill-current`} viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-xs font-black text-gray-700">{averageRating > 0 ? averageRating : 'Bez ocjene'}</span>
                  </div>
                  {renderModeBadge(item.mode, item.location)}
                </div>

                <div className="flex justify-between items-start mb-4 pr-16">
                  <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider block self-start truncate max-w-[120px]">
                    {item.category || "General"}
                  </span>
                  <span className="text-2xl font-black text-gray-900 whitespace-nowrap">{item.price} KM<span className="text-xs text-gray-400 font-normal">/h</span></span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">{item.title}</h3>
                
                <p className="text-gray-500 text-sm line-clamp-3 mb-4 flex-grow">{item.description}</p>
                
                <div className="flex items-center gap-3 pt-4 border-t border-gray-50 mt-auto w-[65%]">
                  <img src={avatarUrl} className="w-8 h-8 rounded-full object-cover" alt="Author Avatar"/>
                  <span className="text-sm font-semibold text-gray-700 truncate">{item.author?.name || 'Nepoznat mentor'}</span>
                </div>
              </div>
            );
          })}
        </div>

        {listings.length === 0 && !error && (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
            <p className="text-gray-400 text-lg italic">Nema rezultata za vašu pretragu.</p>
          </div>
        )}
      </main>

      <FilterModal 
        isOpen={isFilterModalOpen} 
        onClose={() => setIsFilterModalOpen(false)} 
        onApply={handleApplyFilters}
        initialFilters={{
          category: activeFilters.category,
          minPrice: activeFilters.minPrice,
          maxPrice: activeFilters.maxPrice,
          minRating: activeFilters.minRating,
          mode: activeFilters.mode,
          location: activeFilters.location
        }}
      />
    </div>
  );
}