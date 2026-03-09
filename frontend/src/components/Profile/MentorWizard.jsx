export default function MentorWizard({ onClose }) {
  const [step, setStep] = useState(1);
  const [files, setFiles] = useState([]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Mentor Aplikacija</h2>
            <span className="text-sm text-gray-400 font-mono">Korak {step}/2</span>
          </div>

          {step === 1 ? (
            <div className="space-y-4">
              <label className="block text-sm font-bold text-gray-700">Šta želite podučavati?</label>
              <input type="text" className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500" placeholder="npr. Diskretna matematika, Python..." />
              <label className="block text-sm font-bold text-gray-700">Kratka biografija</label>
              <textarea className="w-full p-4 bg-gray-50 border-none rounded-2xl h-32" placeholder="Vaše iskustvo..."></textarea>
              <button onClick={() => setStep(2)} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold mt-4">Dalje</button>
            </div>
          ) : (
            <div className="space-y-4 text-center">
              <div className="border-2 border-dashed border-gray-200 rounded-3xl py-12 px-6">
                <p className="text-gray-500 mb-4">Priložite dokaze (Indeks, Certifikati, CV)</p>
                <input type="file" multiple className="hidden" id="fileUpload" onChange={(e) => setFiles([...e.target.files])} />
                <label htmlFor="fileUpload" className="cursor-pointer bg-gray-100 px-6 py-2 rounded-xl text-sm font-bold hover:bg-gray-200 transition">Izaberi fajlove</label>
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  {files.map(f => <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-xs">{f.name}</span>)}
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 bg-gray-100 py-4 rounded-2xl font-bold">Nazad</button>
                <button className="flex-2 bg-green-600 text-white py-4 px-10 rounded-2xl font-bold">Pošalji zahtjev</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}