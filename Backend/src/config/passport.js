import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import prisma from '../database/prismaClient.js';

/**
 * Google OAuth Strategy
 */
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/v1/auth/google/callback',
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Check if user already exists
                let user = await prisma.user.findFirst({
                    where: {
                        OR: [
                            { email: profile.emails[0].value },
                            {
                                provider: 'google',
                                providerId: profile.id,
                            },
                        ],
                    },
                    include: { roles: true },
                });

                if (user) {
                    // Update existing user with Google info if needed
                    if (!user.provider || user.provider !== 'google') {
                        user = await prisma.user.update({
                            where: { id: user.id },
                            data: {
                                provider: 'google',
                                providerId: profile.id,
                                avatar: profile.photos?.[0]?.value,
                                isVerified: true,
                                emailVerifiedAt: new Date(),
                                lastLoginAt: new Date(),
                            },
                            include: { roles: true },
                        });
                    } else {
                        // Just update last login
                        user = await prisma.user.update({
                            where: { id: user.id },
                            data: { lastLoginAt: new Date() },
                            include: { roles: true },
                        });
                    }
                } else {
                    // Create new user from Google profile
                    const handle = profile.emails[0].value.split('@')[0] + '_' + Math.random().toString(36).substring(7);

                    // Get default PENTESTER role
                    const defaultRole = await prisma.role.findUnique({
                        where: { type: 'PENTESTER' },
                    });

                    user = await prisma.user.create({
                        data: {
                            email: profile.emails[0].value,
                            fullName: profile.displayName,
                            handle,
                            provider: 'google',
                            providerId: profile.id,
                            avatar: profile.photos?.[0]?.value,
                            status: 'ACTIVE',
                            isVerified: true,
                            emailVerifiedAt: new Date(),
                            lastLoginAt: new Date(),
                            roles: defaultRole ? {
                                connect: { id: defaultRole.id },
                            } : undefined,
                        },
                        include: { roles: true },
                    });
                }

                return done(null, user);
            } catch (error) {
                return done(error, null);
            }
        }
    )
);

/**
 * JWT Strategy for protected routes
 */
const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
};

passport.use(
    new JwtStrategy(jwtOptions, async (payload, done) => {
        try {
            const user = await prisma.user.findUnique({
                where: { id: payload.id },
                include: { roles: true },
            });

            if (!user) {
                return done(null, false);
            }

            // Check if user is suspended or banned
            if (user.status === 'SUSPENDED' || user.status === 'BANNED') {
                return done(null, false);
            }

            return done(null, user);
        } catch (error) {
            return done(error, false);
        }
    })
);

export default passport;
