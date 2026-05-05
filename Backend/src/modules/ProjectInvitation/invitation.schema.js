import { z } from 'zod';

export const sendInvitationSchema = z.object({
    pentestId: z.string().uuid('Invalid pentest ID'),
    hackerId: z.string().uuid('Invalid hacker ID'),
    message: z.string().max(1000).optional(),
    expiresAt: z.string().datetime().optional(),
});

export const respondInvitationSchema = z.object({
    status: z.enum(['ACCEPTED', 'REJECTED'], {
        errorMap: () => ({ message: 'Status must be ACCEPTED or REJECTED' }),
    }),
});
