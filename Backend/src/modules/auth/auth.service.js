import prisma from '../../database/prismaClient.js';

class AuthService {
    /**
     * Get user profile by ID
     * This is used for the /me endpoint to return synchronized user data.
     */
    async getUserProfile(userId) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { roles: true },
        });

        if (!user) {
            return null;
        }

        // Remove sensitive fields just in case they exist
        const { passwordHash, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    /**
     * Optional: Logout all devices (could be implemented via Auth0 Management API if needed)
     */
    async logoutAll(userId) {
        // In Auth0, "logout all" is handled by Auth0 sessions. 
        // Locally, we can invalidate our local refresh tokens if any are still used.
        await prisma.refreshToken.deleteMany({
            where: { userId },
        });

        return {
            message: 'Local session cleared. Please also log out from Auth0.',
        };
    }
}

export default new AuthService();
