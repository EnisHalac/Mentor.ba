import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../api/auth";
import { isValidEmail, isValidPassword } from "../utils/validators";

export default function Register() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const checkCapsLock = (e) => setCapsLock(e.getModifierState("CapsLock"));

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!isValidEmail(formData.email)) return setError("Email nije validan.");
    if (!isValidPassword(formData.password)) return setError("Lozinka mora imati min 6 karaktera.");

    setLoading(true);
    try {
      await registerUser(formData);
      alert("Nalog kreiran uspješno!");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Greška na serveru.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full bg-[#f0f2f5] font-sans overflow-x-hidden">
      <div className="flex-1 flex flex-col justify-center items-center px-[10%] bg-white animate-fadeIn py-12 md:py-0">
        <h1 className="text-6xl md:text-[4rem] font-extrabold text-[#1877f2] mb-4 tracking-tighter">Mentor.ba</h1>
        <p className="text-xl md:text-[1.5rem] text-[#1c1e21] max-w-[500px] leading-tight text-center md:text-left">
          Uči od najboljih. Postani jedan od njih. <br />
          <span className="font-bold">Besplatno</span> se registruj i pristupi bazi mentora.
        </p>
      </div>

      <div className="flex-1 flex justify-center items-center p-6 md:p-12 animate-slideInRight">
        <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-[400px] animate-cardFade">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Registracija</h2>
          {error && <div className="bg-[#ffebe9] text-[#d93025] p-3 rounded-md mb-4 text-sm text-center border border-[#ffc1c0] italic">{error}</div>}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold">Ime i prezime</label>
              <input type="text" name="name" className="w-full p-3 border border-[#dddfe2] rounded-md focus:outline-blue-500" placeholder="npr. Amar Hadžić" onChange={handleChange} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold">Email</label>
              <input type="email" name="email" className="w-full p-3 border border-[#dddfe2] rounded-md focus:outline-blue-500" placeholder="vaš@email.com" onChange={handleChange} required />
            </div>
            <div className="space-y-1 relative">
              <label className="text-sm font-semibold">Lozinka</label>
              <div className="relative flex items-center">
                <input type={showPassword ? "text" : "password"} name="password" className="w-full p-3 pr-12 border border-[#dddfe2] rounded-md focus:outline-blue-500" placeholder="Min. 6 karaktera" onChange={handleChange} onKeyDown={checkCapsLock} onKeyUp={checkCapsLock} required />
                <button type="button" className="absolute right-3 text-[#8a8d91] hover:text-[#1877f2]" onClick={() => setShowPassword(!showPassword)}>
                  <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
              {capsLock && <small className="text-[#f57c00] text-xs font-medium">⚠️ Caps Lock je uključen!</small>}
            </div>
            <button type="submit" disabled={loading} className="w-full p-3 bg-[#1877f2] text-white rounded-md text-xl font-bold hover:bg-[#166fe5] transition-colors disabled:opacity-50 mt-2">
              {loading ? "Slanje..." : "Napravi nalog"}
            </button>
          </form>

          <div className="mt-6">
            <div className="flex items-center text-[#8a8d91] text-xs mb-4 before:content-[''] before:flex-1 before:h-[1px] before:bg-[#dddfe2] before:mr-2 after:content-[''] after:flex-1 after:h-[1px] after:bg-[#dddfe2] after:ml-2">Ili nastavi putem</div>
            <div className="flex justify-center gap-4">
              <button className="w-12 h-12 rounded-full border border-[#dddfe2] flex justify-center items-center hover:bg-[#f0f2f5] hover:scale-110 transition-all text-[#DB4437] text-xl"><i className="fab fa-google"></i></button>
              <button className="w-12 h-12 rounded-full border border-[#dddfe2] flex justify-center items-center hover:bg-[#f0f2f5] hover:scale-110 transition-all text-[#333] text-xl"><i className="fab fa-github"></i></button>
            </div>
          </div>
          <div className="text-center border-t border-[#dddfe2] pt-6 mt-6 text-sm">
            Već imaš nalog? <Link to="/login" className="text-[#1877f2] font-semibold hover:underline">Prijavi se</Link>
          </div>
        </div>
      </div>
    </div>
  );
}