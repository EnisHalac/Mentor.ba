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
    if (!user) return alert("You must be logged in.");
    try {
      const res = await toggleEnrollment(id);
      if (res.ok || res.status === 200) {
        setEnrollmentStatus(prev => {
          if (prev === "PENDING" || prev === "ACTIVE") return "CANCELLED";
          return "PENDING";
        });
      }
    } catch (err) {
      alert(err.response?.data?.message || "Error on server. Check the console for details.");
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

  if (loading) return <div className="min-h-screen pt-20 text-center">Učitavanje...</div>;
  if (!listing) return <div className="min-h-screen pt-20 text-center">Oglas nije pronađen.</div>;

  const isAuthor = user?.id === listing.authorId;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto pt-10 px-4">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-800 mb-6 font-semibold">
          &larr; Nazad na oglase
        </button>

        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <div className="flex justify-between items-start mb-6">
            <span className="bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider">
              {listing.category}
            </span>
            <span className="text-4xl font-black text-gray-900">{listing.price} KM<span className="text-lg text-gray-400 font-normal">/h</span></span>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-6">{listing.title}</h1>
          <p className="text-gray-600 text-lg leading-relaxed mb-10">{listing.description}</p>

          <div className="border-t border-gray-100 pt-8 flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <img 
                src={`https://ui-avatars.com/api/?name=${listing.author?.name}&background=random`} 
                className="w-16 h-16 rounded-full border-2 border-gray-100" 
                alt="Mentor"
              />
              <div>
                <p className="text-sm text-gray-500 uppercase font-bold tracking-wider">Mentor</p>
                <p className="text-xl font-bold text-gray-800">{listing.author?.name}</p>
              </div>
            </div>

            {!isAuthor && (
              <div className="flex gap-4 w-full sm:w-auto">
                <button 
                  onClick={handleContactMentor}
                  className="flex-1 sm:flex-none px-6 py-3 bg-gray-100 text-gray-800 rounded-xl font-bold hover:bg-gray-200 transition"
                >
                    Kontakt
                </button>
                <button 
                  onClick={handleToggle}
                  disabled={enrollmentStatus === "COMPLETED"}
                  className={`flex-1 sm:flex-none px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all ${
                    enrollmentStatus === "COMPLETED" 
                      ? "bg-green-500 cursor-not-allowed shadow-green-200" 
                      : enrollmentStatus === "ACTIVE"
                      ? "bg-red-500 hover:bg-red-600 shadow-red-200"
                      : enrollmentStatus === "PENDING"
                      ? "bg-yellow-500 hover:bg-yellow-600 shadow-yellow-200"
                      : "bg-blue-600 hover:bg-blue-700 shadow-blue-200"
                  }`}
                >
                  {enrollmentStatus === "COMPLETED" ? "Završeno" 
                    : enrollmentStatus === "ACTIVE" ? "Otkaži prijavu" 
                    : enrollmentStatus === "PENDING" ? "Na čekanju (Otkaži)" 
                    : "Prijavi se"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}