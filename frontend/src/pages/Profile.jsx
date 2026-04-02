import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import MentorWizard from "../components/Profile/MentorWizard";
import EditProfileModal from "../components/Profile/EditProfileModal";
import Navbar from "../components/Navbar";

export default function Profile() {
  const { user, setUser } = useAuth();
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleUpdate = (updatedUser) => {
    setUser({ ...user, ...updatedUser });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <Navbar />
      <div className="max-w-5xl mx-auto pt-10 px-4">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8 border border-gray-100">
          <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
          <div className="px-8 pb-8">
            <div className="relative -mt-16 mb-4 flex justify-between items-end">
              <img 
                src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random`} 
                className="w-32 h-32 rounded-3xl border-4 border-white shadow-lg object-cover bg-white"
                alt="Profile"
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
            <p className="text-gray-500 font-medium">{user.email}</p>
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
                  <p className="text-sm text-gray-500">Ukupni poeni</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="md:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-6">Moje Aktivnosti</h2>
            <div className="text-center py-12 text-gray-400 italic">
              Još uvijek nemate završenih sesija učenja.
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