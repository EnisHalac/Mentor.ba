import { useEffect, useState } from "react";
import apiClient from "../api/apiClient";
import Navbar from "../components/Navbar";
import RejectModal from "../components/Admin/RejectModal";

export default function AdminDashboard() {
  const [requests, setRequests] = useState([]);
  const [listings, setListings] = useState([]); 
  const [stats, setStats] = useState({ users: 0, mentors: 0, pending: 0 });
  const [selectedReq, setSelectedReq] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [reqRes, statRes, listRes] = await Promise.allSettled([
        apiClient.get("/admin/requests"),
        apiClient.get("/admin/stats"),
        apiClient.get("/admin/listings")
      ]);

      if (reqRes.status === "fulfilled") setRequests(reqRes.value.data);
      if (statRes.status === "fulfilled") setStats(statRes.value.data.stats || statRes.value.data);
      if (listRes.status === "fulfilled") setListings(listRes.value.data);
      
    } catch (err) {
      console.error("Unexpected error in loadData:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleApprove = async (id) => {
    if(!confirm("Approve mentor?")) return;
    await apiClient.post(`/admin/approve/${id}`);
    loadData();
  };

  const handleReject = async (reason) => {
    await apiClient.post(`/admin/reject/${selectedReq.id}`, { reason });
    setSelectedReq(null);
    loadData();
  };

  const handleDeleteListing = async (id) => {
    if(!confirm("Are you sure you want to delete this listing?")) return;
    try {
      await apiClient.delete(`/admin/listings/${id}`);
      loadData(); 
    } catch (err) {
      console.error("Error deleting listing:", err);
      alert("Error deleting listing. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-xl font-bold text-gray-400 animate-pulse">Učitavanje dashboarda...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-black mb-8 text-gray-800 tracking-tight">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <p className="text-gray-400 text-xs font-bold uppercase">Korisnici</p>
            <p className="text-3xl font-black text-blue-600">{stats.users || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <p className="text-gray-400 text-xs font-bold uppercase">Mentori</p>
            <p className="text-3xl font-black text-green-600">{stats.mentors || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <p className="text-gray-400 text-xs font-bold uppercase">Čekaju Odobrenje</p>
            <p className="text-3xl font-black text-orange-500">{Array.isArray(requests) ? requests.length : 0}</p>
          </div>
        </div>

        <div className="mb-10">
          <h2 className="text-xl font-black mb-4 text-gray-700">Zahtjevi za mentore</h2>
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
                {Array.isArray(requests) && requests.length > 0 ? (
                  requests.map(req => (
                    <tr key={req.id} className="hover:bg-indigo-50/30 transition">
                      <td className="p-6">
                        <p className="font-bold text-gray-800">{req.user?.name || "Nepoznat"}</p>
                        <p className="text-xs text-gray-400">{req.user?.email}</p>
                      </td>
                      <td className="p-6 font-medium text-gray-600">{req.subject}</td>
                      <td className="p-6 flex justify-center gap-3">
                        <button onClick={() => handleApprove(req.id)} className="bg-green-100 text-green-700 px-4 py-2 rounded-xl text-xs font-black hover:bg-green-200 transition">ODOBRI</button>
                        <button onClick={() => setSelectedReq({id: req.id, name: req.user?.name})} className="bg-red-100 text-red-700 px-4 py-2 rounded-xl text-xs font-black hover:bg-red-200 transition">ODBIJ</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="3" className="p-8 text-center text-gray-400 font-medium">Nema zahtjeva na čekanju.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-black mb-4 text-gray-700">Svi Aktivni Oglasi</h2>
          <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-gray-100">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-400 text-[10px] uppercase font-bold tracking-widest">
                <tr>
                  <th className="p-6">Naslov / Predmet</th>
                  <th className="p-6">Autor (Mentor)</th>
                  <th className="p-6">Cijena</th>
                  <th className="p-6 text-center">Akcije</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {Array.isArray(listings) && listings.length > 0 ? (
                  listings.map(listing => (
                    <tr key={listing.id} className="hover:bg-gray-50 transition">
                      <td className="p-6">
                        <p className="font-bold text-gray-800">{listing.title}</p>
                        <p className="text-xs text-gray-400">{listing.subject}</p>
                      </td>
                      <td className="p-6">
                        <p className="font-medium text-gray-600">{listing.author?.name || "Nepoznat"}</p>
                      </td>
                      <td className="p-6 font-bold text-indigo-600">
                        {listing.price} KM
                      </td>
                      <td className="p-6 flex justify-center">
                        <button onClick={() => handleDeleteListing(listing.id)} className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-xs font-black hover:bg-red-100 transition">
                          OBRIŠI OGLAS
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="4" className="p-8 text-center text-gray-400 font-medium">Trenutno nema kreiranih oglasa.</td></tr>
                )}
              </tbody>
            </table>
          </div>
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