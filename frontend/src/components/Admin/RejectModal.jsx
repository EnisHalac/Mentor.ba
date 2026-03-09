import { useState } from "react";

export default function RejectModal({ isOpen, onClose, onConfirm, userName }) {
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 transform transition-all scale-100">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-gray-800">Odbijanje zahtjeva</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        
        <p className="text-gray-600 mb-6">
          Korisnik <span className="font-bold">{userName}</span> će dobiti obavijest o odbijanju. Napišite razlog:
        </p>

        <textarea
          className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-red-500 focus:ring-0 transition h-32 mb-6"
          placeholder="npr. Dokumenti nisu čitljivi..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 font-bold text-gray-500 hover:bg-gray-100 rounded-2xl transition">
            Odustani
          </button>
          <button 
            disabled={!reason}
            onClick={() => onConfirm(reason)}
            className="flex-1 bg-red-500 text-white py-3 rounded-2xl font-bold shadow-lg shadow-red-200 hover:bg-red-600 disabled:opacity-50 transition"
          >
            Potvrdi
          </button>
        </div>
      </div>
    </div>
  );
}