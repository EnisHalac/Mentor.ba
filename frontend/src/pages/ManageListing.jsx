import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getListingEnrollments, approveEnrollment, completeEnrollment } from '../api/enrollments';

export default function ManageListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const data = await getListingEnrollments(id);
        if (data.ok) setEnrollments(data.enrollments);
      } catch (error) {
        console.error("Greška:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEnrollments();
  }, [id]);

  const handleApprove = async (studentId) => {
    try {
      const res = await approveEnrollment(id, studentId);
      if (res.ok) {
        setEnrollments(prev => 
          prev.map(e => e.userId === studentId ? { ...e, status: "ACTIVE" } : e)
        );
      }
    } catch (error) { alert("Greška pri odobravanju."); }
  };

  // NOVA FUNKCIJA ZA ZAVRŠAVANJE
  const handleComplete = async (studentId) => {
    if (!window.confirm("Da li ste sigurni da želite označiti ove instrukcije kao završene?")) return;
    try {
      const res = await completeEnrollment(id, studentId);
      if (res.ok) {
        setEnrollments(prev => 
          prev.map(e => e.userId === studentId ? { ...e, status: "COMPLETED" } : e)
        );
      }
    } catch (error) { alert("Greška pri označavanju završenim."); }
  };

  if (loading) return <div className="min-h-screen pt-20 text-center text-gray-500">Učitavanje...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto pt-10 px-4">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-800 mb-6 font-semibold">
          &larr; Nazad na profil
        </button>
        
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Upravljanje prijavama</h1>
          
          {enrollments.length === 0 ? (
            <div className="text-center text-gray-500 py-10">Nema prijava za ovaj oglas.</div>
          ) : (
            <div className="space-y-4">
              {enrollments.map((enrollment) => (
                <div key={enrollment.id} className="flex flex-col sm:flex-row items-center justify-between p-5 border border-gray-100 rounded-xl bg-white shadow-sm gap-4">
                  <div className="flex items-center gap-4">
                    <img 
                      src={enrollment.user.avatar || `https://ui-avatars.com/api/?name=${enrollment.user.name}&background=random`} 
                      className="w-14 h-14 rounded-full" alt="Student"
                    />
                    <div>
                      <h3 className="font-bold text-gray-900">{enrollment.user.name}</h3>
                      <p className="text-sm text-gray-500">{enrollment.user.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {/* Statusni bedževi */}
                    {enrollment.status === "PENDING" && <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold">NA ČEKANJU</span>}
                    {enrollment.status === "ACTIVE" && <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">AKTIVNO</span>}
                    {enrollment.status === "COMPLETED" && <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">ZAVRŠENO</span>}
                    
                    {/* Dugme za Odobravanje */}
                    {enrollment.status === "PENDING" && (
                      <button onClick={() => handleApprove(enrollment.user.id)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 transition">
                        Odobri
                      </button>
                    )}

                    {/* Dugme za Završavanje - Vidljivo samo ako je ACTIVE */}
                    {enrollment.status === "ACTIVE" && (
                      <button onClick={() => handleComplete(enrollment.user.id)} className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold text-sm hover:bg-green-700 transition">
                        Završi kurs
                      </button>
                    )}

                    {/* Dugme za Chat */}
                    {(enrollment.status === "ACTIVE" || enrollment.status === "COMPLETED") && (
                      <button onClick={() => navigate(`/chat/${enrollment.user.id}`)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold text-sm hover:bg-gray-200 transition">
                        Poruka
                      </button>
                    )}
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