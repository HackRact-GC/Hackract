import React, { createContext, useCallback, useContext, useState } from "react";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem("hackract_notifications");
    return saved ? JSON.parse(saved) : [];
  });
  const [unreadCount, setUnreadCount] = useState(() => {
    const saved = localStorage.getItem("hackract_notifications");
    const list = saved ? JSON.parse(saved) : [];
    return list.filter((n) => !n.isRead).length;
  });

  const saveToStorage = (list) => {
    localStorage.setItem("hackract_notifications", JSON.stringify(list));
  };

  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: Date.now(),
      isRead: false,
      ...notification,
      timestamp: notification.timestamp || new Date().toISOString(),
    };
    setNotifications((prev) => {
      const updated = [newNotification, ...prev].slice(0, 50);
      saveToStorage(updated);
      return updated;
    });
    setUnreadCount((prev) => prev + 1);
  }, []);

  const markAsRead = useCallback((id) => {
    setNotifications((prev) => {
      const updated = prev.map((n) =>
        n.id === id && !n.isRead ? { ...n, isRead: true } : n,
      );
      saveToStorage(updated);
      return updated;
    });
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, isRead: true }));
      saveToStorage(updated);
      return updated;
    });
    setUnreadCount(0);
  }, []);

  const markChatAsRead = useCallback((conversationId) => {
    setNotifications((prev) => {
      const updated = prev.map((n) =>
        n.type === "CHAT_MESSAGE" &&
        n.conversationId === conversationId &&
        !n.isRead
          ? { ...n, isRead: true }
          : n,
      );
      saveToStorage(updated);

      // Recalculate unread count
      const newUnread = updated.filter((n) => !n.isRead).length;
      setUnreadCount(newUnread);

      return updated;
    });
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
    localStorage.removeItem("hackract_notifications");
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markChatAsRead,
        markAllAsRead,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider",
    );
  }
  return context;
};
