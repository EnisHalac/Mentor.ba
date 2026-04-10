import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getListingEnrollments, approveEnrollment, completeEnrollment, rejectEnrollment } from '../api/enrollments';
import { useAuth } from "../context/AuthContext";

export default function ManageListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const data = await getListingEnrollments(id);
        if (data.ok) setEnrollments(data.enrollments);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchEnrollments();
  }, [id]);

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
      console.error("Error starting chat:", error);
    }
  };

  const handleApprove = async (studentId) => {
    try {
      const res = await approveEnrollment(id, studentId);
      if (res.ok) {
        setEnrollments(prev => 
          prev.map(e => e.userId === studentId ? { ...e, status: "ACTIVE" } : e)
        );
      }
    } catch (error) {
      alert("Error approving enrollment.");
    }
  };

  const handleReject = async (studentId) => {
    if (!window.confirm("Reject enrollment?")) return;
    try {
      const res = await rejectEnrollment(id, studentId);
      if (res.ok) setEnrollments(prev => prev.filter(e => e.userId !== studentId));
    } catch (error) {
      alert("Error rejecting enrollment.");
    }
  };

  const handleComplete = async (studentId) => {
    if (!window.confirm("Complete course?")) return;
    try {
      const res = await completeEnrollment(id, studentId);
      if (res.ok) {
        setEnrollments(prev => 
          prev.map(e => e.userId === studentId ? { ...e, status: "COMPLETED" } : e)
        );
      }
    } catch (error) {
      alert("Greška.");
    }
  };

  if (loading) return <div className="min-h-screen pt-20 text-center text-gray-500 font-medium">Učitavanje...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto pt-10 px-4">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-800 mb-6 font-semibold flex items-center gap-2">
          &larr; Nazad na profil
        </button>
        
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Upravljanje prijavama</h1>
          
          {enrollments.length === 0 ? (
            <div className="text-center text-gray-500 py-10">Nema prijava.</div>
          ) : (
            <div className="space-y-4">
              {enrollments.map((enrollment) => (
                <div key={enrollment.id} className="flex flex-col sm:flex-row items-center justify-between p-5 border border-gray-100 rounded-2xl bg-white shadow-sm gap-4">
                  <div className="flex items-center gap-4">
                    <img 
                      src={enrollment.user.avatar || `https://ui-avatars.com/api/?name=${enrollment.user.name}&background=random`} 
                      className="w-14 h-14 rounded-xl object-cover" alt="Student"
                    />
                    <div>
                      <h3 className="font-bold text-gray-900">{enrollment.user.name}</h3>
                      <p className="text-sm text-gray-500">{enrollment.user.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {enrollment.status === "PENDING" && (
                      <div className="flex gap-2">
                        <button onClick={() => handleApprove(enrollment.user.id)} className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition">
                          Odobri
                        </button>
                        <button onClick={() => handleReject(enrollment.user.id)} className="px-4 py-2 bg-red-50 text-red-600 rounded-xl font-bold text-sm hover:bg-red-100 transition">
                          Odbij
                        </button>
                      </div>
                    )}

                    {enrollment.status === "ACTIVE" && (
                      <button onClick={() => handleComplete(enrollment.user.id)} className="px-4 py-2 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition">
                        Završi kurs
                      </button>
                    )}

                    {enrollment.status === "COMPLETED" && <span className="text-blue-600 font-bold text-sm">ZAVRŠENO</span>}
                    
                    <button 
                      onClick={() => handleContactStudent(enrollment.user.id)} 
                      className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 font-bold text-sm transition"
                    >
                      Poruka
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}