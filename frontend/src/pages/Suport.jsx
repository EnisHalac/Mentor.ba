import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

export default function Support() {
  const { user, token } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [activeTicket, setActiveTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const API_URL = import.meta.env.VITE_API_BASE_URL;

  const getStatusStyle = (status) => {
    switch (status) {
      case "OPEN": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "IN_PROGRESS": return "bg-blue-100 text-blue-700 border-blue-200";
      case "RESOLVED": return "bg-green-100 text-green-700 border-green-200";
      case "CLOSED": return "bg-gray-100 text-gray-500 border-gray-200";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const isAdmin = user?.role === "ADMIN" || user?.role?.name === "ADMIN";

  const fetchTickets = useCallback(async () => {
    if (!token) return;
    try {
      const endpoint = isAdmin ? "/tickets/admin/all" : "/tickets/my-tickets";
      const res = await fetch(`${API_URL}${endpoint}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.ok) {
        setTickets(data.tickets);
      }
    } catch (e) {
      console.error("Greška pri dohvatanju tiketa", e);
    }
  }, [token, API_URL, isAdmin]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  useEffect(() => {
    if (!activeTicket || !token) return;
    const fetchMessages = async () => {
      try {
        const res = await fetch(`${API_URL}/tickets/${activeTicket.id}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.ok) {
          setMessages(data.ticket.messages || []);
          setActiveTicket(prev => ({ ...prev, status: data.ticket.status })); 
        }
      } catch (e) {}
    };
    
    fetchMessages();
    const inv = setInterval(fetchMessages, 5000);
    return () => clearInterval(inv);
  }, [activeTicket?.id, token, API_URL]);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!newSubject.trim() || !newDescription.trim()) return;

    try {
      const res = await fetch(`${API_URL}/tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ subject: newSubject, description: newDescription })
      });
      const data = await res.json();
      if (data.ok) {
        setIsCreating(false);
        setNewSubject("");
        setNewDescription("");
        fetchTickets();
        setActiveTicket(data.ticket);
      }
    } catch (e) {
      alert("Greška pri kreiranju tiketa.");
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeTicket) return;
    try {
      const res = await fetch(`${API_URL}/tickets/${activeTicket.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ message: newMessage })
      });
      const data = await res.json();
      if (data.ok) {
        setMessages(prev => [...prev, data.reply]);
        setNewMessage("");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleChangeStatus = async (newStatus) => {
    try {
      const res = await fetch(`${API_URL}/tickets/admin/${activeTicket.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.ok) {
        setActiveTicket(prev => ({ ...prev, status: newStatus }));
        fetchTickets(); 
      }
    } catch (e) {
      alert("Greška pri promjeni statusa.");
    }
  };

  const isTicketClosed = activeTicket?.status === "RESOLVED" || activeTicket?.status === "CLOSED";

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Navbar />
      <div className="flex flex-1 overflow-hidden max-w-7xl mx-auto w-full border-x border-gray-200 shadow-sm">
        
        <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col h-full">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <span className="font-bold text-lg text-gray-800">Tiketi Podrške</span>
            {!isAdmin && (
              <button 
                onClick={() => { setIsCreating(true); setActiveTicket(null); }} 
                className="p-2 px-4 bg-indigo-100 text-indigo-700 font-bold rounded-full hover:bg-indigo-200 transition text-sm"
              >
                + Novi Tiket
              </button>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {tickets.length === 0 ? (
              <p className="p-6 text-center text-gray-400 font-medium">Nema aktivnih tiketa.</p>
            ) : (
              tickets.map(ticket => (
                <div 
                  key={ticket.id} 
                  onClick={() => { setActiveTicket(ticket); setIsCreating(false); }} 
                  className={`p-4 cursor-pointer border-l-4 border-b border-b-gray-100 transition-all ${activeTicket?.id === ticket.id ? 'bg-indigo-50 border-l-indigo-500' : 'border-l-transparent hover:bg-gray-50'}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-bold text-gray-800 truncate pr-2">#{ticket.id} - {ticket.subject}</p>
                    <span className={`text-[10px] font-bold px-2 py-1 border rounded-md ${getStatusStyle(ticket.status)}`}>
                      {ticket.status}
                    </span>
                  </div>
                  {isAdmin && ticket.creator && (
                    <p className="text-xs text-gray-500 font-medium">Korisnik: {ticket.creator.name}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(ticket.createdAt).toLocaleDateString("bs-BA")}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-white">
          
          {isCreating ? (
            <div className="flex-1 flex flex-col p-8 items-center bg-gray-50">
              <div className="w-full max-w-lg bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Otvori novi tiket</h2>
                <form onSubmit={handleCreateTicket} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Naslov problema</label>
                    <input 
                      type="text" 
                      required
                      value={newSubject} 
                      onChange={(e) => setNewSubject(e.target.value)} 
                      placeholder="Npr. Problem sa oglasom, Greška pri uplati..." 
                      className="w-full border rounded-lg px-4 py-2 bg-gray-50 focus:outline-none focus:border-indigo-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Detaljan opis</label>
                    <textarea 
                      required
                      value={newDescription} 
                      onChange={(e) => setNewDescription(e.target.value)} 
                      placeholder="Opišite detaljno problem koji imate..." 
                      rows="5"
                      className="w-full border rounded-lg px-4 py-2 bg-gray-50 focus:outline-none focus:border-indigo-500 resize-none" 
                    />
                  </div>
                  <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition">
                    Pošalji tiket podršci
                  </button>
                </form>
              </div>
            </div>
          ) : activeTicket ? (
            <>
              <div className="p-4 border-b shadow-sm z-10 bg-white flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">#{activeTicket.id} - {activeTicket.subject}</h3>
                  <p className="text-sm text-gray-500">{activeTicket.description}</p>
                </div>
                
                {isAdmin && (
                  <select 
                    value={activeTicket.status} 
                    onChange={(e) => handleChangeStatus(e.target.value)}
                    className={`text-xs font-bold px-3 py-2 border rounded-lg focus:outline-none cursor-pointer ${getStatusStyle(activeTicket.status)}`}
                  >
                    <option value="OPEN">Otvoreno (OPEN)</option>
                    <option value="IN_PROGRESS">U obradi (IN PROGRESS)</option>
                    <option value="RESOLVED">Riješeno (RESOLVED)</option>
                    <option value="CLOSED">Zatvoreno (CLOSED)</option>
                  </select>
                )}
                {!isAdmin && (
                  <span className={`text-xs font-bold px-3 py-1.5 border rounded-lg ${getStatusStyle(activeTicket.status)}`}>
                    {activeTicket.status}
                  </span>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
                {messages.length === 0 && (
                  <div className="text-center text-gray-400 text-sm mt-4">Nema poruka. Vaš tiket je poslat i podrška će vam se javiti uskoro.</div>
                )}
                {messages.map(msg => {
                  const isMe = msg.senderId === user?.id;
                  const senderName = isMe ? "Vi" : msg.sender?.name || "Korisnik";
                  const isAdminReply = msg.sender?.role === "ADMIN" || msg.sender?.role?.name === "ADMIN";

                  return (
                    <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <span className="text-[10px] font-bold text-gray-400 mb-1 mx-1">
                        {senderName} {isAdminReply && !isMe ? "(Podrška)" : ""}
                      </span>
                      <div className={`px-5 py-3 rounded-2xl max-w-[70%] shadow-sm ${
                        isMe 
                          ? 'bg-indigo-600 text-white rounded-br-none' 
                          : isAdminReply 
                            ? 'bg-emerald-50 border border-emerald-200 text-gray-800 rounded-bl-none' 
                            : 'bg-white border text-gray-800 rounded-bl-none'
                      }`}>
                        {msg.message}
                      </div>
                    </div>
                  );
                })}
              </div>

              <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2 bg-white">
                <input 
                  type="text" 
                  value={newMessage} 
                  onChange={(e) => setNewMessage(e.target.value)} 
                  disabled={isTicketClosed}
                  placeholder={isTicketClosed ? "Ovaj tiket je zatvoren." : "Odgovori podršci..."} 
                  className={`flex-1 border rounded-full px-6 py-3 focus:outline-none ${isTicketClosed ? 'bg-gray-100 cursor-not-allowed text-gray-400' : 'bg-gray-50 focus:border-indigo-500'}`} 
                />
                <button 
                  type="submit" 
                  disabled={!newMessage.trim() || isTicketClosed} 
                  className={`px-6 py-2 rounded-full font-bold transition ${!newMessage.trim() || isTicketClosed ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                >
                  Slanje
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50 font-medium">
              <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
              Izaberite tiket sa lijeve strane
            </div>
          )}
        </div>
      </div>
    </div>
  );
}