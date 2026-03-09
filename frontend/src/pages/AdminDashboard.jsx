import { useEffect, useState } from "react";
import apiClient from "../api/apiClient";
import Navbar from "../components/Navbar";
import RejectModal from "../components/Admin/RejectModal";

export default function AdminDashboard() {
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({ users: 0, mentors: 0, pending: 0 });
  const [selectedReq, setSelectedReq] = useState(null);

  const loadData = async () => {
    try {
      const [reqRes, statRes] = await Promise.all([
        apiClient.get("/admin/requests"),
        apiClient.get("/admin/stats")
      ]);
      setRequests(reqRes.data);
      setStats(statRes.data);
    } catch (err) { console.error("Greška pri loadu"); }
  };

  useEffect(() => { loadData(); }, []);

  const handleApprove = async (id) => {
    if(!confirm("Odobriti mentora?")) return;
    await apiClient.post(`/admin/approve/${id}`);
    loadData();
  };

  const handleReject = async (reason) => {
    await apiClient.post(`/admin/reject/${selectedReq.id}`, { reason });
    setSelectedReq(null);
    loadData();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-black mb-8 text-gray-800 tracking-tight">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <p className="text-gray-400 text-xs font-bold uppercase">Korisnici</p>
            <p className="text-3xl font-black text-blue-600">{stats.users}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <p className="text-gray-400 text-xs font-bold uppercase">Mentori</p>
            <p className="text-3xl font-black text-green-600">{stats.mentors}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <p className="text-gray-400 text-xs font-bold uppercase">Čekaju Odobrenje</p>
            <p className="text-3xl font-black text-orange-500">{requests.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-gray-100">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-400 text-[10px] uppercase font-bold tracking-widest">
              <tr>
                <th className="p-6">Korisnik</th>
                <th className="p-6">Predmet</th>
                <th className="p-6 text-center">Akcije</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {requests.map(req => (
                <tr key={req.id} className="hover:bg-indigo-50/30 transition">
                  <td className="p-6">
                    <p className="font-bold text-gray-800">{req.user.name}</p>
                    <p className="text-xs text-gray-400">{req.user.email}</p>
                  </td>
                  <td className="p-6 font-medium text-gray-600">{req.subject}</td>
                  <td className="p-6 flex justify-center gap-3">
                    <button onClick={() => handleApprove(req.id)} className="bg-green-100 text-green-700 px-4 py-2 rounded-xl text-xs font-black hover:bg-green-200">ODOBRI</button>
                    <button onClick={() => setSelectedReq({id: req.id, name: req.user.name})} className="bg-red-100 text-red-700 px-4 py-2 rounded-xl text-xs font-black hover:bg-red-200">ODBIJ</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <RejectModal 
        isOpen={!!selectedReq} 
        userName={selectedReq?.name} 
        onClose={() => setSelectedReq(null)} 
        onConfirm={handleReject} 
      />
    </div>
  );
}