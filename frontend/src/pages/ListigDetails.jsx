import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../api/apiClient";
import { toggleEnrollment, getMyEnrollments } from "../api/enrollments";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

export default function ListingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  
  const [listing, setListing] = useState(null);
  const [enrollmentStatus, setEnrollmentStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const { data } = await apiClient.get(`/listings/${id}`);
        setListing(data);

        if (user) {
          const enrollmentsRes = await getMyEnrollments();
          if (enrollmentsRes.ok) {
            const currentEnrollment = enrollmentsRes.enrollments.find(e => e.listingId === Number(id));
            setEnrollmentStatus(currentEnrollment ? currentEnrollment.status : null);
          }
        }
      } catch (err) {
        console.error("Error fetching listing details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id, user]);

  const handleToggle = async () => {
    if (!user) return alert("You must be logged in to enroll.");
    try {
      const res = await toggleEnrollment(id);
      if (res.ok || res.status === 200) {
        setEnrollmentStatus(prev => {
          if (prev === "PENDING" || prev === "ACTIVE") return "CANCELLED";
          return "PENDING";
        });
      }
    } catch (err) {
      alert(err.response?.data?.message || "Error on server.");
      console.error("Toggle error:", err);
    }
  };

  const handleContactMentor = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/chat/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ targetUserId: listing.authorId })
      });
      const data = await res.json();
      if (data.ok) {
        navigate("/messages", { state: { activeChatId: data.conversation.id } });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const renderModeBadge = (mode, location) => {
    if (mode === "ONLINE") return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider block text-center w-full mt-2">Online Nastava</span>;
    if (mode === "ONSITE") return <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider block text-center w-full mt-2">Uživo {location && `(${location})`}</span>;
    if (mode === "HYBRID") return <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider block text-center w-full mt-2">Hybrid {location && `(${location})`}</span>;
    return null;
  };

  if (loading) return <div className="min-h-screen pt-20 text-center text-gray-500 font-medium">Učitavanje detalja...</div>;
  if (!listing) return <div className="min-h-screen pt-20 text-center text-red-500 font-medium">Oglas nije pronađen.</div>;

  const isAuthor = user?.id === listing.authorId;
  const avatarUrl = listing.author?.avatar || `https://ui-avatars.com/api/?name=${listing.author?.name || 'M'}&background=6366f1&color=fff&bold=true`;
  
  const reviews = listing.author?.reviewsReceived || [];
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) 
    : 0;

  return (
    <div className="min-h-screen bg-[#fcfcfd]">
      <Navbar />
      
      <div className="max-w-6xl mx-auto pt-10 px-4 pb-20">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 mb-8 font-semibold transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Nazad na pretragu
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 flex flex-col items-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
              
              <img 
                src={avatarUrl} 
                className="w-32 h-32 rounded-full border-4 border-white shadow-xl object-cover relative z-10 bg-white mt-8" 
                alt="Mentor Avatar"
              />
              
              <h2 className="text-2xl font-black text-gray-900 mt-4 text-center">{listing.author?.name}</h2>
              <p className="text-gray-500 text-sm font-medium uppercase tracking-widest mb-2">Mentor</p>
              
              {renderModeBadge(listing.mode, listing.location)}

              <a href="#reviews" className="mt-4 flex items-center gap-2 hover:bg-gray-50 px-3 py-1.5 rounded-xl transition cursor-pointer">
                <div className="flex text-yellow-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className={`w-5 h-5 ${star <= Math.round(averageRating) ? 'fill-current' : 'text-gray-200 fill-current'}`} viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="font-bold text-gray-800">{averageRating > 0 ? averageRating : 'Nema ocjena'}</span>
                <span className="text-xs text-gray-400">({reviews.length})</span>
              </a>

              {listing.author?.portfolioUrl && (
                <a 
                  href={listing.author.portfolioUrl.startsWith('http') ? listing.author.portfolioUrl : `https://${listing.author.portfolioUrl}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mt-6 flex items-center gap-2 text-sm text-indigo-600 font-semibold hover:text-indigo-800 bg-indigo-50 px-4 py-2 rounded-xl transition w-full justify-center"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                  Portfolio
                </a>
              )}

              {!isAuthor && (
                <div className="w-full mt-6 space-y-3">
                  <button 
                    onClick={handleToggle}
                    disabled={enrollmentStatus === "COMPLETED"}
                    className={`w-full py-3.5 rounded-xl font-black text-white shadow-lg transition-all ${
                      enrollmentStatus === "COMPLETED" 
                        ? "bg-green-500 cursor-not-allowed shadow-green-200" 
                        : enrollmentStatus === "ACTIVE"
                        ? "bg-red-500 hover:bg-red-600 shadow-red-200"
                        : enrollmentStatus === "PENDING"
                        ? "bg-yellow-500 hover:bg-yellow-600 shadow-yellow-200 text-yellow-900"
                        : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200"
                    }`}
                  >
                    {enrollmentStatus === "COMPLETED" ? "Nastava završena" 
                      : enrollmentStatus === "ACTIVE" ? "Otkaži instrukcije" 
                      : enrollmentStatus === "PENDING" ? "Na čekanju (Otkaži)" 
                      : "Prijavi se za instrukcije"}
                  </button>

                  <button 
                    onClick={handleContactMentor}
                    className="w-full py-3.5 bg-gray-100 text-gray-800 rounded-xl font-bold hover:bg-gray-200 transition flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                    Pošalji poruku
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
              <div className="flex flex-wrap justify-between items-start mb-6 gap-4">
                <span className="bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider">
                  {listing.category}
                </span>
                <div className="text-right">
                  <span className="text-4xl font-black text-gray-900">{listing.price} KM</span>
                  <span className="text-lg text-gray-400 font-normal">/sat</span>
                </div>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-6 leading-tight">{listing.title}</h1>
              
              <div className="prose prose-lg prose-indigo max-w-none text-gray-600 leading-relaxed">
                <p className="whitespace-pre-wrap">{listing.description}</p>
              </div>
            </div>

            <div id="reviews" className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 scroll-mt-24">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                Utisci polaznika
                <span className="bg-yellow-100 text-yellow-800 text-sm py-1 px-3 rounded-full font-bold">{reviews.length}</span>
              </h3>

              {reviews.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-gray-100 rounded-2xl">
                  <p className="text-gray-400 italic">Ovaj mentor još uvijek nema recenzija.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review, idx) => {
                    const reviewerAvatar = review.student?.avatar || `https://ui-avatars.com/api/?name=${review.student?.name || 'User'}&background=random`;
                    return (
                      <div key={idx} className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <img 
                              src={reviewerAvatar} 
                              className="w-10 h-10 rounded-full object-cover bg-white border border-gray-200" 
                              alt="Student"
                              onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${review.student?.name || 'User'}`; }}
                            />
                            <div>
                              <p className="font-bold text-gray-800">{review.student?.name || "Student"}</p>
                              <div className="flex text-yellow-400 mt-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <svg key={i} className={`w-4 h-4 ${i < review.rating ? "fill-current" : "text-gray-300 fill-current"}`} viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-600 italic">"{review.comment}"</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}