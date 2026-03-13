import { useState } from "react";
import apiClient from "../../api/apiClient";

export default function EditProfileModal({ user, onClose, onUpdate }) {
  const [formData, setFormData] = useState({ 
    name: user.name, 
    oldPassword: "", 
    newPassword: "" 
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    const data = new FormData();
    data.append("name", formData.name);
    
    if (formData.oldPassword && formData.newPassword) {
      data.append("oldPassword", formData.oldPassword);
      data.append("newPassword", formData.newPassword);
    }

    if (avatarFile) {
      data.append("avatarFile", avatarFile);
    }

    try {
      const res = await apiClient.put("/users/profile", data);
      onUpdate(res.data.user);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Error updating profile. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl">
        <h2 className="text-xl font-bold mb-6">Uredi profil</h2>
        {error && <p className="text-red-500 mb-4 font-semibold text-sm">{error}</p>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-bold mb-1 block">Ime</label>
            <input 
              className="w-full p-3 bg-gray-50 rounded-xl" 
              placeholder="Ime" 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
            />
          </div>

          <div>
            <label className="text-sm font-bold mb-1 block">Nova profilna slika</label>
            <input 
              type="file" 
              accept="image/*"
              className="w-full p-3 bg-gray-50 rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
              onChange={e => setAvatarFile(e.target.files[0])} 
            />
          </div>

          <div className="border-t pt-4 mt-4">
            <h3 className="text-sm font-bold mb-3 text-gray-500">Promjena lozinke (opcionalno)</h3>
            <input 
              type="password"
              className="w-full p-3 bg-gray-50 rounded-xl mb-3" 
              placeholder="Trenutna lozinka" 
              value={formData.oldPassword} 
              onChange={e => setFormData({...formData, oldPassword: e.target.value})} 
            />
            <input 
              type="password"
              className="w-full p-3 bg-gray-50 rounded-xl" 
              placeholder="Nova lozinka" 
              value={formData.newPassword} 
              onChange={e => setFormData({...formData, newPassword: e.target.value})} 
            />
          </div>

          <div className="flex gap-3 mt-6 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition">Odustani</button>
            <button type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200">Spremi promjene</button>
          </div>
        </form>
      </div>
    </div>
  );
}