import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function ManageListing() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto pt-10 px-4">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-800 mb-6 font-semibold">
          &larr; Nazad na profil
        </button>
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Upravljanje oglasom #{id}</h1>
          <p className="text-gray-500">Lista učenika</p>
        </div>
      </div>
    </div>
  );
}