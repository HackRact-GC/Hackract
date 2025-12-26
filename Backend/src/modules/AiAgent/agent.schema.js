import { z } from "zod";

export const createAgentSchema = z.object({
    assistantId: z.string().uuid(),
    pentestId: z.string().uuid().optional(),
    name: z.string().optional(),
    messages: z.any().optional() // JSON
});

export const updateAgentSchema = z.object({
    name: z.string().optional(),
    messages: z.any().optional(),
    tokensUsed: z.number().optional(),
    isActive: z.boolean().optional()
});
