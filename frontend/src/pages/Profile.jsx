import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getMyEnrollments, getAuthorStats } from "../api/enrollments";
import apiClient from "../api/apiClient";
import MentorWizard from "../components/Profile/MentorWizard";
import EditProfileModal from "../components/Profile/EditProfileModal";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import UserNotifications from "../components/UserNotifications";
import ReviewModal from "../components/Profile/ReviewModal";

export default function Profile() {
  const { user, setUser, token } = useAuth();
  const navigate = useNavigate();

  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [myEnrollments, setMyEnrollments] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewModalData, setReviewModalData] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const enrollRes = await getMyEnrollments();
      if (enrollRes?.ok) setMyEnrollments(enrollRes.enrollments || []);

      if (user?.role === "MENTOR") {
        const statsRes = await getAuthorStats();
        if (statsRes?.ok) setMyListings(statsRes.listings || []);
        
        try {
          const response = await apiClient.get('/enrollments/reviews/mentor');
          if (response.data?.ok) {
            setReviews(response.data.reviews || []);
          }
        } catch (apiErr) {
          console.error("Greška pri dohvatanju recenzija:", apiErr.response?.data || apiErr.message);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const handleUpdate = (updatedUser) => {
    setUser({ ...user, ...updatedUser });
  };

  const handleContactStudent = async (studentId) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/chat/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ targetUserId: studentId })
      });
      const data = await res.json();
      if (data.ok) {
        navigate("/messages", { state: { activeChatId: data.conversation.id } });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const activeEnrollments = myEnrollments.filter(en => en.status !== "COMPLETED");
  const completedEnrollments = myEnrollments.filter(en => en.status === "COMPLETED");
  
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) 
    : 0;

  const renderModeBadge = (mode, location) => {
    const badges = {
      ONLINE: <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-bold">Online</span>,
      ONSITE: <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full font-bold">Uživo ({location})</span>,
      HYBRID: <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-bold">Hybrid ({location})</span>
    };
    return badges[mode] || null;
  };

  if (loading && !user) return <div className="text-center pt-20 font-bold text-gray-500">Učitavanje...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <Navbar />
      <div className="pt-6">
         <UserNotifications /> 
      </div>
      
      <div className="max-w-6xl mx-auto pt-4 px-4">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8 border border-gray-100">
          <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
          <div className="px-8 pb-8">
            <div className="relative -mt-16 mb-4 flex justify-between items-end">
              <img 
                src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(String(user?.name || "User"))}&background=random`}
                className="w-32 h-32 rounded-3xl border-4 border-white shadow-lg object-cover bg-white"
                alt="Profil"
              />
              <div className="flex gap-3">
                <button onClick={() => setIsEditModalOpen(true)} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition">Uredi profil</button>
                {user?.role === "USER" && (
                  <button onClick={() => setIsWizardOpen(true)} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 shadow-lg shadow-blue-200 transition">Postani Mentor</button>
                )}
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-800">{String(user?.name || "Korisnik")}</h1>
            <p className="text-gray-500 font-medium">{user?.email} • <span className="text-indigo-600">{user?.role}</span></p>
            
            {user?.role === "MENTOR" && (
              <div className="flex items-center gap-2 mt-3 bg-yellow-50 w-fit px-4 py-1.5 rounded-full border border-yellow-100 cursor-pointer hover:bg-yellow-100 transition" onClick={() => document.getElementById('my-reviews')?.scrollIntoView({ behavior: 'smooth' })}>
                <div className="flex text-yellow-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className={`w-4 h-4 ${star <= Math.round(averageRating) ? 'fill-current' : 'text-gray-200 fill-current'}`} viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="font-bold text-yellow-700">{averageRating > 0 ? averageRating : 'Nema ocjena'}</span>
                <span className="text-xs text-yellow-600">({reviews.length} recenzija)</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-gray-400 uppercase text-xs font-bold tracking-wider mb-4">Postignuća</h3>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 text-xl font-bold">XP</div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{user?.xp || 0}</p>
                  <p className="text-sm text-gray-500">Ukupno bodova</p>
                </div>
              </div>
            </div>

            {user?.role === "MENTOR" && reviews.length > 0 && (
              <div id="my-reviews" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 scroll-mt-6">
                <h3 className="text-gray-400 uppercase text-xs font-bold tracking-wider mb-4 flex items-center justify-between">
                  Utisci studenata
                  <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-[10px]">{reviews.length}</span>
                </h3>
                <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
                  {reviews.map((review, idx) => {
                    const reviewerName = review.student?.name || "Student";
                    const reviewerAvatar = review.student?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(reviewerName)}&background=random`;
                    
                    return (
                      <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex items-center gap-3 mb-2">
                          <img 
                            src={reviewerAvatar} 
                            className="w-8 h-8 rounded-full object-cover border border-gray-200 bg-white"
                            alt="Student"
                          />
                          <div className="flex-1">
                            <p className="text-xs font-bold text-gray-800">{reviewerName}</p>
                            <div className="flex text-yellow-400">
                              {[...Array(5)].map((_, i) => (
                                <svg key={i} className={`w-3 h-3 ${i < review.rating ? "fill-current" : "text-gray-200 fill-current"}`} viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 italic leading-relaxed">"{review.comment}"</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          
          <div className="md:col-span-2 space-y-8">
            {user?.role === "MENTOR" && (
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold mb-6">Upravljanje nastavom</h2>
                <div className="space-y-4">
                  {myListings.length === 0 ? <p className="text-gray-400 italic text-center">Nema objavljenih oglasa.</p> : myListings.map((listing) => (
                    <div key={listing.id} className="flex justify-between items-center p-4 border rounded-xl hover:bg-gray-50 transition">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-gray-800">{listing.title}</h4>
                          {renderModeBadge(listing.mode, listing.location)}
                        </div>
                        <p className="text-sm text-gray-500">{listing.activeCount || 0} aktivnih studenata</p>
                        <p className="text-xs text-orange-600 font-bold">{listing.pendingCount || 0} novih zahtjeva</p>
                      </div>
                      <button onClick={() => navigate(`/manage-listing/${listing.id}`)} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-bold ml-4">Upravljaj</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-6">Aktivno učenje</h2>
              {activeEnrollments.length === 0 ? <p className="text-gray-400 italic text-center border border-dashed py-4 rounded-xl">Nema aktivnih prijava.</p> : (
                <div className="space-y-4">
                  {activeEnrollments.map((en) => (
                    <div key={en.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div>
                        <h4 className="font-bold text-gray-800">{en.listing?.title}</h4>
                        <p className="text-sm text-gray-500">Mentor: {String(en.listing?.author?.name || "Mentor")}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${en.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {en.status === 'ACTIVE' ? 'Aktivno' : 'Na čekanju'}
                        </span>
                        <button 
                          onClick={() => handleContactStudent(en.listing?.authorId)}
                          className="p-2 bg-white text-gray-600 rounded-lg border hover:bg-gray-100 transition"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-6">Završene sesije</h2>
              {completedEnrollments.length === 0 ? <p className="text-gray-400 italic text-center">Nema završenih sesija.</p> : (
                <div className="space-y-4">
                  {completedEnrollments.map((en) => {
                    const hasReview = en.review !== null && en.review !== undefined;
                    return (
                      <div key={en.id} className="flex justify-between items-center p-4 border rounded-xl bg-gray-50">
                        <div>
                          <h4 className="font-bold text-gray-800">{en.listing?.title}</h4>
                          <p className="text-sm text-gray-500">Mentor: {String(en.listing?.author?.name || "Mentor")}</p>
                        </div>
                        <div>
                          {hasReview ? (
                            <span className="text-[11px] font-black uppercase tracking-widest text-green-600 bg-green-50 px-3 py-1 rounded-md">Završeno</span>
                          ) : (
                            <button 
                              onClick={() => setReviewModalData({ mentorId: en.listing?.authorId, enrollmentId: en.id })}
                              className="px-4 py-2 bg-yellow-400 text-yellow-900 rounded-lg text-sm font-bold hover:bg-yellow-500 transition"
                            >
                              Ocijeni
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isWizardOpen && <MentorWizard isOpen={isWizardOpen} onClose={() => setIsWizardOpen(false)} onComplete={(updatedUser) => { setUser(updatedUser); setIsWizardOpen(false); }} />}
      {isEditModalOpen && <EditProfileModal isOpen={isEditModalOpen} user={user} onClose={() => setIsEditModalOpen(false)} onUpdate={handleUpdate} token={token} />}
      {reviewModalData && (
        <ReviewModal 
          isOpen={!!reviewModalData}
          targetUserId={reviewModalData.mentorId}
          enrollmentId={reviewModalData.enrollmentId}
          onClose={() => setReviewModalData(null)}
          onSuccess={() => { setReviewModalData(null); fetchData(); }}
        />
      )}
    </div>
  );
}