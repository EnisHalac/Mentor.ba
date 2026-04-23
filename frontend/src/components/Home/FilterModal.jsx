import { useState, useEffect } from "react";
import apiClient from "../../api/apiClient"; 

export default function FilterModal({ isOpen, onClose, onApply, initialFilters }) {
  const [localFilters, setLocalFilters] = useState({
    category: "",
    minPrice: "",
    maxPrice: "",
    minRating: "",
    mode: "",
    location: ""
  });

  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableLocations, setAvailableLocations] = useState([]);

  useEffect(() => {
    const fetchExistingData = async () => {
      try {
        const response = await apiClient.get("/listings");
        const uniqueCategories = [...new Set(response.data.map(item => item.category))].filter(Boolean);
        const uniqueLocations = [...new Set(response.data.map(item => item.location))].filter(Boolean);
        
        setAvailableCategories(uniqueCategories);
        setAvailableLocations(uniqueLocations);
      } catch (err) {
        console.error("Failed to fetch filter data");
      }
    };

    if (isOpen) {
      fetchExistingData();
      setLocalFilters(initialFilters);
    }
  }, [isOpen, initialFilters]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "mode" && (value === "ONLINE" || value === "")) {
      setLocalFilters(prev => ({ ...prev, [name]: value, location: "" }));
    } else {
      setLocalFilters(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const handleClear = () => {
    const cleared = { category: "", minPrice: "", maxPrice: "", minRating: "", mode: "", location: "" };
    setLocalFilters(cleared);
    onApply(cleared);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-xl font-black text-gray-800">Filteri pretrage</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 font-bold text-xl">&times;</button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Kategorija</label>
            <select 
              name="category" 
              value={localFilters.category} 
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:outline-none focus:border-indigo-500 transition cursor-pointer"
            >
              <option value="">Sve kategorije</option>
              {availableCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Format nastave</label>
            <select 
              name="mode" 
              value={localFilters.mode} 
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:outline-none focus:border-indigo-500 transition cursor-pointer"
            >
              <option value="">Svi formati</option>
              <option value="ONLINE">Samo Online</option>
              <option value="ONSITE">Uživo (Onsite)</option>
              <option value="HYBRID">Kombinovano (Hybrid)</option>
            </select>
          </div>

          {(localFilters.mode === "ONSITE" || localFilters.mode === "HYBRID") && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-200">
              <label className="block text-sm font-bold text-gray-700 mb-2">Grad</label>
              <select 
                name="location" 
                value={localFilters.location} 
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:outline-none focus:border-indigo-500 transition cursor-pointer"
              >
                <option value="">Svi dostupni gradovi</option>
                {availableLocations.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Min. Cijena (KM)</label>
              <input type="number" name="minPrice" value={localFilters.minPrice} onChange={handleChange} placeholder="0" min="0" className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:outline-none focus:border-indigo-500 transition"/>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Max. Cijena (KM)</label>
              <input type="number" name="maxPrice" value={localFilters.maxPrice} onChange={handleChange} placeholder="Bez limita" min="0" className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:outline-none focus:border-indigo-500 transition"/>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Minimalna ocjena mentora</label>
            <select name="minRating" value={localFilters.minRating} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:outline-none focus:border-indigo-500 transition cursor-pointer">
              <option value="">Sve ocjene</option>
              <option value="4">4.0 i više</option>
              <option value="4.5">4.5 i više</option>
              <option value="5">Samo 5.0</option>
            </select>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 flex gap-3 bg-gray-50/50">
          <button onClick={handleClear} className="w-1/3 bg-white border border-gray-200 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-100 transition">Očisti</button>
          <button onClick={handleApply} className="w-2/3 bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition shadow-sm">Primijeni</button>
        </div>
      </div>
    </div>
  );
}