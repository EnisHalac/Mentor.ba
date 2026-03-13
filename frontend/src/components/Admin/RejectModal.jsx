import { useState } from "react";

export default function RejectModal({ isOpen, onClose, onConfirm, mode = "reject", request, userName }) {
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";

  let safeProofFiles = [];
  if (Array.isArray(request?.proofFiles)) {
    safeProofFiles = request.proofFiles;
  } else if (typeof request?.proofFiles === 'string') {
    try {
      safeProofFiles = JSON.parse(request.proofFiles);
    } catch (e) {
      safeProofFiles = [];
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8 transform transition-all scale-100">
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-xl font-bold text-gray-800">
            {mode === "reject" ? "Odbijanje zahtjeva" : "Detalji prijave"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        {mode === "reject" ? (
          <>
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
          </>
        ) : (
          <div className="space-y-4 text-sm text-gray-700 max-h-96 overflow-y-auto pr-2">
            <p><strong className="text-gray-900">Predmet:</strong> {request?.subject}</p>
            <p><strong className="text-gray-900">Iskustvo:</strong> {request?.experience}</p>
            <p><strong className="text-gray-900">Edukacija:</strong> {request?.education || "Nije navedeno"}</p>
            
            <div className="flex gap-4 pt-2">
              {request?.linkedinUrl && (
                <a href={request.linkedinUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-medium">
                  LinkedIn Profil
                </a>
              )}
              {request?.githubUrl && (
                <a href={request.githubUrl} target="_blank" rel="noreferrer" className="text-gray-800 hover:underline font-medium">
                  GitHub Profil
                </a>
              )}
            </div>

            <div className="pt-4 border-t border-gray-100">
              <strong className="text-gray-900">Priloženi dokumenti:</strong>
              {safeProofFiles.length > 0 ? (
                <ul className="mt-3 space-y-2">
                  {safeProofFiles.map((path, idx) => (
                    <li key={idx}>
                      <a 
                        href={`${supabaseUrl}/storage/v1/object/public/mentor-proofs/${path}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="inline-flex items-center text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-2 rounded-lg text-xs font-bold transition"
                      >
                        {path.split('/').pop()}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 mt-2 italic">Nema priloženih dokumenata ili je format nevažeći.</p>
              )}
            </div>

            <button onClick={onClose} className="w-full mt-8 bg-gray-100 text-gray-800 py-3 rounded-xl font-bold hover:bg-gray-200 transition">
              Zatvori
            </button>
          </div>
        )}
      </div>
    </div>
  );
}