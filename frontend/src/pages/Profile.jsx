import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getMyEnrollments, getAuthorStats } from "../api/enrollments";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [myEnrollments, setMyEnrollments] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const enrollRes = await getMyEnrollments();
        if (enrollRes.ok) setMyEnrollments(enrollRes.enrollments);

        if (user?.role === "MENTOR") {
          const statsRes = await getAuthorStats();
          if (statsRes.ok) setMyListings(statsRes.listings);
        }
      } catch (err) {
        console.error("Error fetching profile data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchData();
  }, [user]);

  if (loading) return <div className="text-center pt-20">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto pt-10 px-4">
        
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-8 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <img 
              src={`https://ui-avatars.com/api/?name=${user?.name}&background=random`} 
              className="w-20 h-20 rounded-full border-4 border-indigo-50" 
              alt="Avatar"
            />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{user?.name}</h1>
              <p className="text-gray-500">
                {user?.email} • <span className="font-semibold text-indigo-600">{user?.role}</span>
              </p>
            </div>
          </div>
          <button 
            onClick={logout} 
            className="px-6 py-2 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition"
          >
            Odjava
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Moje prijave(Učenje)</h2>
            {myEnrollments.length === 0 ? (
              <div className="bg-white p-6 rounded-2xl border border-dashed border-gray-300 text-gray-400 text-center">
                Niste prijavljeni ni na jednu instrukciju. Pregledajte dostupne oglase i unaprijedite svoje znanje!
              </div>
            ) : (
              myEnrollments.map((en) => (
                <div key={en.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="font-bold text-lg">{en.listing.title}</h3>
                  <p className="text-sm text-gray-500 mb-3">Mentor: {en.listing.author.name}</p>
                  <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
                    Aktivan
                  </span>
                </div>
              ))
            )}
          </div>

          {user?.role === "MENTOR" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">Moji oglasi (Nastava)</h2>
              {myListings.length === 0 ? (
                <div className="bg-white p-6 rounded-2xl border border-dashed border-gray-300 text-gray-400 text-center">
                  Niste objavili nijedan oglas još.
                </div>
              ) : (
                myListings.map((listing) => (
                  <div key={listing.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-lg">{listing.title}</h3>
                      <p className="text-sm text-gray-500">Prijavljeni studenti: {listing._count.enrollments}</p>
                    </div>
                    <button 
                      onClick={() => navigate(`/manage-listing/${listing.id}`)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition"
                    >
                      Upravljaj
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}