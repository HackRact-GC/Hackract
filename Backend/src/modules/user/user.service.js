import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const findOrCreateUser = async (user, accessToken) => {
  return await prisma.user.upsert({
    where: { email: user.email },
    update: {
      full_name: user.name,
      role: "USER",
      created_at: new Date(),
    },
    create: {
      email: user.email,
      full_name: user.name,
      role: "USER",
    },
  });
};

export const getAllUsers = async () => prisma.user.findMany({ orderBy: { created_at: "desc" } });

export const getUserById = async (id) => prisma.user.findUnique({ where: { user_id: id } });
