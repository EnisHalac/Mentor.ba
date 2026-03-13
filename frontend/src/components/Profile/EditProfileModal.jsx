import { useState } from "react";
import apiClient from "../../api/apiClient";

export default function EditProfileModal({ user, onClose, onUpdate }) {
  const [formData, setFormData] = useState({ name: user.name, avatar: user.avatar || "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await apiClient.put("/users/profile", formData);
      onUpdate(res.data.user);
      onClose();
    } catch (err) {
      alert("Greška pri ažuriranju!");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl">
        <h2 className="text-xl font-bold mb-6">Uredi profil</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-m font-bold mb-6">Ime</h3>
          <input className="w-full p-3 bg-gray-50 rounded-xl" placeholder="Ime" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          <h3 className="ttext-m font-bold mb-6">Slika</h3>
          <input className="w-full p-3 bg-gray-50 rounded-xl" placeholder="URL slike (Avatar)" value={formData.avatar} onChange={e => setFormData({...formData, avatar: e.target.value})} />
          <div className="flex gap-3 mt-6">
            <button type="button" onClick={onClose} className="flex-1 py-3 font-bold text-gray-500">Odustani</button>
            <button type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded-2xl font-bold">Spremi</button>
          </div>
        </form>
      </div>
    </div>
  );
}