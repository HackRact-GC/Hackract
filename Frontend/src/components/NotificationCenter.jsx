import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiBell, FiX, FiCheck, FiTrash2, FiInfo, FiMail, FiZap, FiTarget } from "react-icons/fi";
import useNotifications from "../hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

const NotificationCenter = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, loading } = useNotifications();

  const getTypeIcon = (type) => {
    switch (type) {
      case "INVITATION": return <FiMail className="text-[#00ff88]" />;
      case "INVITATION_RESPONSE": return <FiCheck className="text-blue-400" />;
      case "FINDING": return <FiTarget className="text-rose-500" />;
      case "PROJECT_UPDATE": return <FiZap className="text-amber-400" />;
      default: return <FiInfo className="text-gray-400" />;
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) markAsRead(notification.id);
    if (notification.link) {
      navigate(notification.link);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-3.5 rounded-2xl bg-white/2 border transition-all group ${
          unreadCount > 0 ? "border-[#00ff88]/30 text-[#00ff88]" : "border-white/5 text-gray-500 hover:text-[#00ff88] hover:border-[#00ff88]/30"
        }`}
      >
        <FiBell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-3.5 right-3.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-4 ring-black animate-pulse" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for closing */}
            <div className="fixed inset-0 z-100" onClick={() => setIsOpen(false)} />
            
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="absolute right-0 mt-4 w-[400px] bg-[#0a0a0a] border border-white/10 rounded-[32px] shadow-2xl z-101 overflow-hidden backdrop-blur-3xl"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/2">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-widest">Global Intelligence</h3>
                  <p className="text-[10px] text-gray-500 font-mono mt-1">
                    {unreadCount} UNREAD NOTIFICATIONS
                  </p>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[10px] font-black text-[#00ff88] uppercase tracking-widest hover:underline"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="max-h-[500px] overflow-y-auto scrollbar-hide py-2">
                {loading && notifications.length === 0 ? (
                  <div className="p-12 flex justify-center">
                    <div className="w-6 h-6 border-2 border-white/10 border-t-[#00ff88] rounded-full animate-spin" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-16 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto text-white/10">
                      <FiBell size={32} />
                    </div>
                    <p className="text-[10px] text-gray-600 font-mono uppercase tracking-[0.2em]">Silence across the wire</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={`group p-5 hover:bg-white/4 transition-all cursor-pointer border-l-2 relative ${
                        n.isRead ? "border-transparent" : "border-[#00ff88] bg-[#00ff88]/2"
                      }`}
                    >
                      <div className="flex gap-4">
                        <div className={`w-10 h-10 rounded-xl bg-black border border-white/10 flex items-center justify-center shrink-0 shadow-inner`}>
                          {getTypeIcon(n.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <h4 className={`text-xs font-bold truncate ${n.isRead ? "text-gray-400" : "text-white"}`}>
                              {n.title}
                            </h4>
                            <span className="text-[9px] text-gray-600 font-mono shrink-0 whitespace-nowrap">
                              {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                          <p className={`text-[11px] leading-relaxed mb-3 ${n.isRead ? "text-gray-600" : "text-gray-400"}`}>
                            {n.message}
                          </p>
                          <div className="flex items-center gap-4">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(n.id);
                              }}
                              className="text-[9px] font-black text-gray-700 hover:text-rose-500 uppercase tracking-widest transition-colors flex items-center gap-1.5"
                            >
                              <FiTrash2 size={10} /> Delete
                            </button>
                            {!n.isRead && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(n.id);
                                }}
                                className="text-[9px] font-black text-[#00ff88]/40 hover:text-[#00ff88] uppercase tracking-widest transition-colors flex items-center gap-1.5"
                              >
                                <FiCheck size={10} /> Mark Read
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {notifications.length > 0 && (
                <div className="p-4 border-t border-white/5 text-center bg-white/1">
                   <p className="text-[9px] text-gray-700 font-mono uppercase tracking-[0.3em]">End of Archive</p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationCenter;
