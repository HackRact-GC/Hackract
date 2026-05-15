import prisma from "../../database/prismaClient.js";

export const create = async (data) => {
  return await prisma.notification.create({
    data,
  });
};

export const findByUserId = async (userId, limit = 20) => {
  return await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
};

export const markAsRead = async (id, userId) => {
  return await prisma.notification.updateMany({
    where: { id, userId },
    data: { isRead: true },
  });
};

export const markAllAsRead = async (userId) => {
  return await prisma.notification.updateMany({
    where: { userId },
    data: { isRead: true },
  });
};

export const deleteById = async (id, userId) => {
  return await prisma.notification.deleteMany({
    where: { id, userId },
  });
};
