import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Messages() {
  const { user, token } = useAuth();
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const API_URL = import.meta.env.VITE_API_BASE_URL;

  const fetchConversations = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/chat/conversations`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }
      });
      const data = await res.json();
      if (data.ok) {
        setConversations(data.conversations);
        if (location.state?.activeChatId) {
          const target = data.conversations.find(c => c.id === location.state.activeChatId);
          if (target) setActiveConversation(target);
        }
      }
    } catch (e) {}
  }, [token, API_URL, location.state]);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  useEffect(() => {
    if (!activeConversation || !token) return;
    const fetchMessages = async () => {
      try {
        const res = await fetch(`${API_URL}/chat/conversations/${activeConversation.id}/messages`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.ok) {
          setMessages(data.messages);
          setConversations(prev => prev.map(c => c.id === activeConversation.id ? { ...c, unreadCount: 0 } : c));
          window.dispatchEvent(new Event("messagesRead"));
        }
      } catch (e) {}
    };
    fetchMessages();
    const inv = setInterval(fetchMessages, 3000);
    return () => clearInterval(inv);
  }, [activeConversation, token, API_URL]);

  useEffect(() => {
    if (searchQuery.length < 3) return setSearchResults([]);
    const delay = setTimeout(async () => {
      const res = await fetch(`${API_URL}/chat/search-users?q=${searchQuery}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.ok) setSearchResults(data.users);
    }, 300);
    return () => clearTimeout(delay);
  }, [searchQuery, token, API_URL]);

  const startNewConversation = async (targetUserId) => {
    const res = await fetch(`${API_URL}/chat/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ targetUserId })
    });
    const data = await res.json();
    if (data.ok) {
      setIsSearching(false);
      setSearchQuery("");
      setActiveConversation(data.conversation);
      fetchConversations();
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;
    const res = await fetch(`${API_URL}/chat/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ conversationId: activeConversation.id, content: newMessage })
    });
    const data = await res.json();
    if (data.ok) {
      setMessages(prev => [...prev, data.message]);
      setNewMessage("");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Navbar />
      <div className="flex flex-1 overflow-hidden max-w-7xl mx-auto w-full border-x border-gray-200 shadow-sm">
        <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col h-full">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <span className="font-bold text-lg text-gray-800">Poruke</span>
            <button onClick={() => setIsSearching(!isSearching)} className="p-2 bg-indigo-100 text-indigo-600 rounded-full hover:bg-indigo-200 transition">
              {isSearching ? "X" : "+"}
            </button>
          </div>
          {isSearching ? (
            <div className="flex-1 overflow-y-auto p-4">
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Traži..." className="w-full border rounded-lg px-4 py-2 mb-4 bg-gray-50" autoFocus />
              {searchResults.map(u => (
                <div key={u.id} onClick={() => startNewConversation(u.id)} className="p-3 flex items-center gap-3 cursor-pointer hover:bg-indigo-50 rounded-xl transition">
                  <img src={u.avatar || `https://ui-avatars.com/api/?name=${u.name}`} className="w-10 h-10 rounded-full" />
                  <p className="font-semibold">{u.name}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              {conversations.map(conv => {
                const other = conv.user1Id === user?.id ? conv.user2 : conv.user1;
                return (
                  <div key={conv.id} onClick={() => setActiveConversation(conv)} className={`p-4 flex items-center justify-between cursor-pointer border-l-4 transition-all ${activeConversation?.id === conv.id ? 'bg-indigo-50 border-indigo-500' : 'border-transparent hover:bg-gray-50'}`}>
                    <div className="flex items-center gap-3">
                      <img src={other?.avatar || `https://ui-avatars.com/api/?name=${other?.name}`} className="w-12 h-12 rounded-full shadow-sm" />
                      <p className="font-semibold text-gray-800">{other?.name}</p>
                    </div>
                    {conv.unreadCount > 0 && activeConversation?.id !== conv.id && (
                      <span className="bg-red-500 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full">{conv.unreadCount}</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="flex-1 flex flex-col bg-white">
          {activeConversation ? (
            <>
              <div className="p-4 border-b font-bold text-gray-800 shadow-sm z-10 flex items-center gap-3">
                <span>{activeConversation.user1Id === user?.id ? activeConversation.user2?.name : activeConversation.user1?.name}</span>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`px-5 py-3 rounded-2xl max-w-[70%] shadow-sm ${msg.senderId === user?.id ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border text-gray-800 rounded-bl-none'}`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2">
                <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Poruka..." className="flex-1 border rounded-full px-6 py-3 bg-gray-50 focus:outline-none focus:border-indigo-500" />
                <button type="submit" disabled={!newMessage.trim()} className="bg-indigo-600 text-white px-6 py-2 rounded-full font-bold">Slanje</button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400 bg-gray-50 font-medium">Izaberi razgovor</div>
          )}
        </div>
      </div>
    </div>
  );
}