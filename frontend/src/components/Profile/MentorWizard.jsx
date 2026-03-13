import React, { useState } from "react";
import apiClient from "../../api/apiClient";

export default function MentorWizard({ onClose }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    subject: "",
    experience: "",
    education: "",
    linkedinUrl: "",
    githubUrl: "",
  });
  
  const [files, setFiles] = useState([]);

  const handleSubmit = async () => {
    setLoading(true);
    const data = new FormData();
    
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    
    if (files) {
      Array.from(files).forEach(file => data.append("proofFiles", file));
    }

    try {
      await apiClient.post("/mentor-requests", data);
      alert("Zahtjev uspješno poslan!");
      onClose();
    } catch (err) {
      alert("Greška: " + (err.response?.data?.message || "Token je istekao ili je nevažeći."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white p-8 rounded-3xl w-full max-w-lg shadow-2xl">
        <h2 className="text-2xl font-bold mb-6">Postani Mentor - Korak {step}/3</h2>
        
        {step === 1 && (
          <div className="space-y-4">
            <input className="w-full p-3 bg-gray-50 rounded-xl" placeholder="Oblast podučavanja (npr. React)" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} />
            <input className="w-full p-3 bg-gray-50 rounded-xl" placeholder="LinkedIn URL" value={formData.linkedinUrl} onChange={e => setFormData({...formData, linkedinUrl: e.target.value})} />
            <input className="w-full p-3 bg-gray-50 rounded-xl" placeholder="GitHub URL" value={formData.githubUrl} onChange={e => setFormData({...formData, githubUrl: e.target.value})} />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <label className="text-sm font-bold text-gray-500">Radno iskustvo</label>
            <textarea className="w-full p-3 bg-gray-50 rounded-xl h-24" value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})} />
            <label className="text-sm font-bold text-gray-500">Obrazovanje</label>
            <textarea className="w-full p-3 bg-gray-50 rounded-xl h-24" value={formData.education} onChange={e => setFormData({...formData, education: e.target.value})} />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <label className="block text-sm font-bold text-gray-500">Uploadaj dokaze (Sertifikati, Diplome)</label>
            <input type="file" multiple onChange={e => setFiles(e.target.files)} className="w-full p-3 bg-gray-50 rounded-xl" />
            <p className="text-xs text-gray-400">Možeš odabrati više fajlova odjednom.</p>
          </div>
        )}

        <div className="flex gap-3 mt-8">
          <button onClick={onClose} className="flex-1 py-3 font-bold text-gray-500 hover:bg-gray-100 rounded-xl">Odustani</button>
          {step > 1 && <button onClick={() => setStep(step - 1)} className="flex-1 py-3 font-bold bg-gray-200 rounded-xl">Nazad</button>}
          {step < 3 ? (
            <button onClick={() => setStep(step + 1)} className="flex-1 py-3 font-bold bg-blue-600 text-white rounded-xl">Dalje</button>
          ) : (
            <button onClick={handleSubmit} disabled={loading} className="flex-1 py-3 font-bold bg-green-600 text-white rounded-xl">
              {loading ? "Šaljem..." : "Pošalji zahtjev"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}