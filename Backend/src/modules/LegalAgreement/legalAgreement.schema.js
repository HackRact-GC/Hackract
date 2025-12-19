import { z } from "zod";

export const createAgreementSchema = z.object({
    title: z.string().min(3),
    content: z.string().min(10),
    version: z.string().min(1),
    type: z.string().default('terms_of_service'),
    isActive: z.boolean().default(true)
});

export const updateAgreementSchema = z.object({
    title: z.string().min(3).optional(),
    content: z.string().min(10).optional(),
    version: z.string().min(1).optional(),
    type: z.string().optional(),
    isActive: z.boolean().optional()
});
