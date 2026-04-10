import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

export default function CreateListingModal({ onClose, onCreated }) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    price: "",
    mode: "ONLINE",
    location: "",
    description: "",
  });

  const [showCustomCategory, setShowCustomCategory] = useState(false);

  const defaultCategories = [
    "Programiranje", "Dizajn", "Strani jezici", "Marketing", "Poslovanje", "Video i Audio"
  ];
  
  const bosnianCities = [
    "Sarajevo", "Banja Luka", "Tuzla", "Zenica", "Mostar", "Bihać", 
    "Bijeljina", "Prijedor", "Trebinje", "Doboj", "Brčko", "Cazin", 
    "Gračanica", "Živinice", "Tešanj", "Visoko", "Travnik", "Kakanj", 
    "Goražde", "Konjic", "Ostalo"
  ];

  const [availableCategories, setAvailableCategories] = useState(defaultCategories);

  useEffect(() => {
    const fetchExistingCategories = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/listings`);
        if (res.ok) {
          const data = await res.json();
          const usedCategories = data.map(item => item.category);
          const mergedCategories = [...new Set([...defaultCategories, ...usedCategories])].filter(Boolean);
          setAvailableCategories(mergedCategories);
        }
      } catch (err) {}
    };

    fetchExistingCategories();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCategorySelect = (e) => {
    if (e.target.value === "CUSTOM") {
      setShowCustomCategory(true);
      setFormData({ ...formData, category: "" });
    } else {
      setShowCustomCategory(false);
      setFormData({ ...formData, category: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.mode !== "ONLINE" && !formData.location) {
      setError("Please select a location for Onsite/Hybrid mode.");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        location: formData.mode === "ONLINE" ? null : formData.location
      };

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/listings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error creating listing.");
      }

      onCreated(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Kreiraj novi oglas</h2>
            <p className="text-sm text-gray-500 mt-1">Popuni detalje svoje usluge i počni podučavati.</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Naslov oglasa</label>
            <input 
              type="text" 
              name="title"
              value={formData.title} 
              onChange={handleChange} 
              placeholder="npr. Instrukcije iz React.js za početnike"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition outline-none"
              required 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">Kategorija</label>
              
              {!showCustomCategory ? (
                <select 
                  value={formData.category} 
                  onChange={handleCategorySelect} 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition outline-none appearance-none cursor-pointer"
                  required
                >
                  <option value="" disabled>Odaberi kategoriju...</option>
                  {availableCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  <option value="CUSTOM" className="font-bold text-indigo-600 bg-indigo-50">
                    + Dodaj svoju kategoriju...
                  </option>
                </select>
              ) : (
                <div className="flex gap-2 animate-fadeIn">
                  <input 
                    type="text" 
                    name="category"
                    value={formData.category} 
                    onChange={handleChange} 
                    placeholder="Upiši kategoriju..."
                    className="w-full px-4 py-3 bg-white border border-indigo-300 shadow-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition outline-none"
                    required 
                    autoFocus
                  />
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowCustomCategory(false);
                      setFormData({ ...formData, category: "" });
                    }}
                    title="Vrati se"
                    className="px-4 py-3 bg-gray-100 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition font-bold"
                  >
                    X
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">Cijena (BAM / po satu)</label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-gray-500 font-bold">KM</span>
                <input 
                  type="number" 
                  name="price"
                  min="0"
                  step="0.1"
                  value={formData.price} 
                  onChange={handleChange} 
                  placeholder="25.00"
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition outline-none"
                  required 
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">Format nastave</label>
              <select 
                name="mode"
                value={formData.mode} 
                onChange={handleChange} 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition outline-none appearance-none cursor-pointer"
                required
              >
                <option value="ONLINE">Samo Online</option>
                <option value="ONSITE">Samo Uživo (Onsite)</option>
                <option value="HYBRID">Kombinovano (Hybrid)</option>
              </select>
            </div>

            {formData.mode !== "ONLINE" && (
              <div className="space-y-1 animate-fadeIn">
                <label className="text-sm font-semibold text-gray-700">Lokacija</label>
                <select 
                  name="location"
                  value={formData.location} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition outline-none appearance-none cursor-pointer"
                  required
                >
                  <option value="" disabled>Izaberi grad...</option>
                  {bosnianCities.map(city => <option key={city} value={city}>{city}</option>)}
                </select>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Detaljan opis</label>
            <textarea 
              name="description"
              rows="4"
              value={formData.description} 
              onChange={handleChange} 
              placeholder="Opiši šta nudiš, koji je tvoj pristup, šta studenti mogu očekivati..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition outline-none resize-none"
              required 
            ></textarea>
          </div>
        </form>

        <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-6 py-2.5 text-gray-600 font-semibold hover:bg-gray-200 rounded-xl transition">
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={loading} 
            className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-xl transition flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Publishing...' : 'Publish Listing'}
          </button>
        </div>

      </div>
    </div>
  );
}