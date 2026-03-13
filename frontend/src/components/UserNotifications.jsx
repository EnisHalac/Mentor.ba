import { useEffect, useState } from "react";
import apiClient from "../api/apiClient";

export default function UserNotifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await apiClient.get("/users/notifications");
        if (Array.isArray(res.data)) {
          setNotifications(res.data);
        }
      } catch (err) {
        
      }
    };
    fetchNotifications();
  }, []);

  const dismissNotifications = async () => {
    try {
      await apiClient.put("/users/notifications/read");
      setNotifications([]);
    } catch (err) {
      
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto mb-6">
      {notifications.map((notif) => (
        <div 
          key={notif.id} 
          className={`p-6 rounded-2xl mb-4 flex items-center justify-between shadow-sm border ${
            notif.type === 'SUCCESS' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
          }`}
        >
          <div>
            <h3 className={`font-bold text-lg ${notif.type === 'SUCCESS' ? 'text-green-800' : 'text-red-800'}`}>
              {notif.type === 'SUCCESS' ? 'Čestitamo!' : 'Obavijest'}
            </h3>
            <p className={`text-sm mt-1 ${notif.type === 'SUCCESS' ? 'text-green-600' : 'text-red-600'}`}>
              {notif.message}
            </p>
          </div>
          <button 
            onClick={dismissNotifications}
            className={`px-6 py-2 rounded-xl font-bold transition ${
              notif.type === 'SUCCESS' 
                ? 'bg-green-200 text-green-800 hover:bg-green-300' 
                : 'bg-red-200 text-red-800 hover:bg-red-300'
            }`}
          >
            U redu
          </button>
        </div>
      ))}
    </div>
  );
}