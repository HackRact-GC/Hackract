import { auth } from 'express-oauth2-jwt-bearer';
import AppError from '../utils/AppError.js';
import prisma from '../database/prismaClient.js';
import dotenv from 'dotenv';

dotenv.config();

// Auth0 JWT validation middleware
const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  tokenSigningAlg: 'RS256'
});

export const protect = async (req, res, next) => {
  // First, use Auth0's middleware to validate the token
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
      // Auth0 token is valid. Now sync/fetch user from local DB
      // Auth0 puts the user info in req.auth
      const auth0Id = req.auth.payload.sub;
      console.log('Auth0 Payload:', JSON.stringify(req.auth.payload, null, 2));

      // Try to find user by auth0Id
      let user = await prisma.user.findUnique({
        where: { auth0Id },
        include: { roles: true }
      });

      // If user doesn't exist locally, we might want to create them if they have an email claim
      if (!user) {
        const payload = req.auth.payload;
        let email = payload['https://hackract.com/email'] || payload.email;
        let fullName = payload.name;
        let picture = payload.picture;
        let nickname = payload.nickname;
        let emailVerified = payload.email_verified;

        // Fallback: If email is missing, fetch from Auth0 /userinfo endpoint
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

        if (email) {
          // Check if user exists by email (for migration)
          user = await prisma.user.findUnique({
            where: { email },
            include: { roles: true }
          });

          if (user) {
            // Migrating user to Auth0
            user = await prisma.user.update({
              where: { id: user.id },
              data: {
                auth0Id,
                provider: 'auth0',
                avatar: user.avatar || picture,
                isVerified: user.isVerified || emailVerified || false
              },
              include: { roles: true }
            });
          } else {
            // Auto-create user from Auth0 data
            const defaultRole = await prisma.role.findUnique({
              where: { type: 'PENTESTER' },
            });

            // Generate a unique handle
            let baseHandle = nickname || email.split('@')[0];
            baseHandle = baseHandle.toLowerCase().replace(/[^a-z0-9_]/g, '');
            let handle = baseHandle;
            let counter = 1;

            // Simple check-and-retry for unique handle
            while (await prisma.user.findUnique({ where: { handle } })) {
              handle = `${baseHandle}${counter}`;
              counter++;
            }

            user = await prisma.user.create({
              data: {
                email,
                auth0Id,
                fullName: fullName || nickname || email.split('@')[0],
                handle: handle,
                provider: 'auth0',
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
    // Check if user has at least one of the allowed roles
    const hasPermission = req.user.roles.some(role => allowedRoles.includes(role.type));

    if (!hasPermission) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }

    next();
  };
};