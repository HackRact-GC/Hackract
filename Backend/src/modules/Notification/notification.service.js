import * as repository from "./notification.repository.js";
import app from "../../../app.js";

export const notifyUser = async (userId, { title, message, type, link, metadata }) => {
  const notification = await repository.create({
    userId,
    title,
    message,
    type,
    link,
    metadata: metadata || {},
  });

  // Emit real-time if io is available
  if (global.io) {
    global.io.to(`user:${userId}`).emit("notification:new", notification);
  } else if (app && app.locals && app.locals.sendNotification) {
    // Alternatively use the helper we'll add to app.locals
    app.locals.sendNotification(userId, notification);
  }

  return notification;
};

export const getNotifications = async (userId) => {
  return await repository.findByUserId(userId);
};

export const markRead = async (id, userId) => {
  return await repository.markAsRead(id, userId);
};

export const markAllRead = async (userId) => {
  return await repository.markAllAsRead(userId);
};

export const remove = async (id, userId) => {
  return await repository.deleteById(id, userId);
};
