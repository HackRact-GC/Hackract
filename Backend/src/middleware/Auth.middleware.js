import { auth } from 'express-oauth2-jwt-bearer';
import jwt from 'jsonwebtoken';
import AppError from '../utils/AppError.js';
import prisma from '../database/prismaClient.js';
import dotenv from 'dotenv';

dotenv.config();

const buildFallbackEmail = (auth0Id, nickname) => {
  const safeId = auth0Id.replace(/[^a-zA-Z0-9_-]/g, '-');
  const localPart = nickname ? nickname.toLowerCase().replace(/[^a-z0-9_.-]/g, '-') : safeId;
  return `${localPart || safeId}@placeholder.hackract.local`;
};

// Auth0 JWT validation middleware
const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  tokenSigningAlg: 'RS256'
});

const tryLocalToken = async (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  if (!process.env.JWT_ACCESS_SECRET) return null;

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch (err) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.sub },
    include: { roles: true },
  });

  if (!user) return null;
  if (user.status === 'SUSPENDED' || user.status === 'BANNED') {
    throw new AppError('Account is suspended or banned', 403);
  }

  return user;
};

export const validateLocal = async (req, res, next) => {
  try {
    const user = await tryLocalToken(req);
    if (!user) {
      return next(new AppError('Not authorized to access this route', 401));
    }
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export const protect = async (req, res, next) => {
  try {
    // 1) Try local JWT first
    const localUser = await tryLocalToken(req);
    if (localUser) {
      req.user = localUser;
      return next();
    }
  } catch (localError) {
    return next(localError);
  }

  // 2) Fallback to Auth0 validation
  checkJwt(req, res, async (err) => {
    if (err) {
      console.error('Auth0 Token Validation Error:', err);
      if (err.name === 'InvalidTokenError' || err.code === 'invalid_token') {
        return next(new AppError(`Invalid token: ${err.message}`, 401));
      }
      if (err.name === 'UnauthorizedError' || err.status === 401) {
        return next(new AppError('Not authorized to access this route', 401));
      }
      return next(err);
    }

    try {
      const auth0Id = req.auth.payload.sub;
      const provider = auth0Id?.split('|')?.[0] || 'auth0';
      const providerId = auth0Id?.split('|')?.[1] || auth0Id;
      console.log('Auth0 Payload:', JSON.stringify(req.auth.payload, null, 2));

      let user = await prisma.user.findUnique({
        where: { auth0Id },
        include: { roles: true }
      });

      if (!user) {
        const payload = req.auth.payload;
        let email = payload['https://hackract.com/email'] || payload.email;
        let fullName = payload.name;
        let picture = payload.picture;
        let nickname = payload.nickname;
        let emailVerified = payload.email_verified;

        if (!email) {
          console.log('Email missing from JWT. Fetching from Auth0 /userinfo...');
          try {
            const userInfoResponse = await fetch(`${process.env.AUTH0_ISSUER_BASE_URL}userinfo`, {
              headers: { Authorization: req.headers.authorization }
            });

            if (userInfoResponse.ok) {
              const userInfo = await userInfoResponse.json();
              email = userInfo.email;
              fullName = userInfo.name || fullName;
              picture = userInfo.picture || picture;
              nickname = userInfo.nickname || nickname;
              emailVerified = userInfo.email_verified || emailVerified;
              console.log('Successfully fetched email from /userinfo:', email);
            }
          } catch (fetchError) {
            console.error('Error fetching /userinfo fallback:', fetchError);
          }
        }

        if (!email) {
          email = buildFallbackEmail(auth0Id, nickname);
        }

        user = await prisma.user.findUnique({
          where: { email },
          include: { roles: true }
        });

        if (user) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              auth0Id,
              provider,
              providerId,
              avatar: user.avatar || picture,
              isVerified: user.isVerified || emailVerified || false
            },
            include: { roles: true }
          });
        } else {
          const defaultRole = await prisma.role.findUnique({
            where: { type: 'PENTESTER' },
          });

          let baseHandle = (nickname || email.split('@')[0]).toLowerCase().replace(/[^a-z0-9_]/g, '');
          let handle = baseHandle || `user${Date.now()}`;
          let counter = 1;

          while (await prisma.user.findUnique({ where: { handle } })) {
            handle = `${baseHandle}${counter}`;
            counter++;
          }

          user = await prisma.user.create({
            data: {
              email,
              auth0Id,
              provider,
              providerId,
              fullName: fullName || nickname || email.split('@')[0],
              handle,
              avatar: picture,
              status: 'ACTIVE',
              isVerified: emailVerified || false,
              roles: defaultRole ? {
                connect: { id: defaultRole.id },
              } : undefined,
            },
            include: { roles: true }
          });
        }
      }

      if (!user) {
        return next(new AppError('User not found and could not be synchronized', 404));
      }

      if (user.status === 'SUSPENDED' || user.status === 'BANNED') {
        return next(new AppError('Account is suspended or banned', 403));
      }

      req.user = user;
      next();
    } catch (dbError) {
      next(dbError);
    }
  });
};

export const restrictTo = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.roles) {
      return next(new AppError('User not authenticated correctly', 401));
    }
    const hasPermission = req.user.roles.some(role => allowedRoles.includes(role.type));

    if (!hasPermission) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }

    next();
  };
};