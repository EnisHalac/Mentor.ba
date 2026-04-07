import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getMyEnrollments, getAuthorStats } from "../api/enrollments";
import MentorWizard from "../components/Profile/MentorWizard";
import EditProfileModal from "../components/Profile/EditProfileModal";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchData();
  }, [user]);

  const handleUpdate = (updatedUser) => {
    setUser({ ...user, ...updatedUser });
  };

  const activeEnrollments = myEnrollments.filter(en => en.status !== "COMPLETED");
  const completedEnrollments = myEnrollments.filter(en => en.status === "COMPLETED");

  if (loading) return <div className="text-center pt-20">Učitavanje...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <Navbar />
      
      <div className="max-w-6xl mx-auto pt-10 px-4">
        
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8 border border-gray-100">
          <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
          <div className="px-8 pb-8">
            <div className="relative -mt-16 mb-4 flex justify-between items-end">
              <img 
                src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random`} 
                className="w-32 h-32 rounded-3xl border-4 border-white shadow-lg object-cover bg-white"
                alt="Profil"
              />
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsEditModalOpen(true)}
                  className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition"
                >
                  Uredi profil
                </button>
                {user.role === "USER" && (
                  <button 
                    onClick={() => setIsWizardOpen(true)}
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 shadow-lg shadow-blue-200 transition"
                  >
                    Postani Mentor
                  </button>
                )}
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-800">{user.name}</h1>
            <p className="text-gray-500 font-medium">{user.email} • <span className="text-indigo-600">{user.role}</span></p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-gray-400 uppercase text-xs font-bold tracking-wider mb-4">Postignuća</h3>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 text-xl font-bold">XP</div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{user.xp || 0}</p>
                  <p className="text-sm text-gray-500">Ukupno bodova</p>
                </div>
              </div>
            </div>

            {user.role === "MENTOR" && (
                <div className="bg-indigo-600 p-6 rounded-2xl shadow-lg text-white">
                    <p className="text-indigo-100 text-sm font-bold uppercase tracking-wider">Moji oglasi</p>
                    <p className="text-4xl font-black mt-1">{myListings.length}</p>
                </div>
            )}
          </div>
          
          <div className="md:col-span-2 space-y-8">
            
            {user.role === "MENTOR" && (
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">Upravljanje nastavom</h2>
                <div className="space-y-4">
                  {myListings.length === 0 ? (
                    <p className="text-gray-400 italic py-4 text-center">Još uvijek nemate objavljenih oglasa.</p>
                  ) : (
                    myListings.map((listing) => (
                      <div key={listing.id} className="flex justify-between items-center p-4 border rounded-xl hover:bg-gray-50 transition">
                        <div>
                          <h4 className="font-bold">{listing.title}</h4>
                          <p className="text-sm text-gray-500">{listing._count.enrollments} aktivnih studenata</p>
                        </div>
                        <button 
                          onClick={() => navigate(`/manage-listing/${listing.id}`)}
                          className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-bold"
                        >
                          Upravljaj
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">Aktivno učenje</h2>
              {activeEnrollments.length === 0 ? (
                <p className="text-gray-400 italic py-4 text-center border border-dashed rounded-xl">Trenutno nemate aktivnih prijava.</p>
              ) : (
                <div className="space-y-4">
                  {activeEnrollments.map((en) => (
                    <div key={en.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div>
                        <h4 className="font-bold text-gray-800">{en.listing.title}</h4>
                        <p className="text-sm text-gray-500">Mentor: {en.listing.author.name}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${en.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {en.status === 'ACTIVE' ? 'Aktivno' : 'Na čekanju'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">Završeni kursevi</h2>
              {completedEnrollments.length === 0 ? (
                <p className="text-gray-400 italic py-4 text-center">Još uvijek nemate završenih sesija.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {completedEnrollments.map((en) => (
                    <div key={en.id} className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 flex items-center gap-3">
                      <div>
                        <h4 className="font-bold text-indigo-900 leading-tight">{en.listing.title}</h4>
                        <p className="text-xs text-indigo-500">Završeno</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {isWizardOpen && <MentorWizard onClose={() => setIsWizardOpen(false)} />}
      {isEditModalOpen && (
        <EditProfileModal 
          user={user} 
          onClose={() => setIsEditModalOpen(false)} 
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
}