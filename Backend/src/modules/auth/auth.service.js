import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Upsert user after OAuth login
export const upsertUser = async (userInfo, accessToken) => {
  const { sub, email, name, picture } = userInfo;
  return prisma.user.upsert({
    where: { email },
    update: { full_name: name, picture, lastLogin: new Date() },
    create: { email, full_name: name, picture },
  });
};

// Placeholder: verify access token
export const verifyAccessToken = async (token) => {
  // Implement JWT verification or call Auth0 introspection
  return true;
};

// Placeholder: refresh access token
export const refreshToken = async (userId) => {
  // Implement refresh logic via OAuth provider
  return "new_access_token";
};
