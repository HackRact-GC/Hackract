import { z } from "zod";

export const createAssistantSchema = z.object({
    name: z.string().min(3),
    model: z.string().min(3),
    systemPrompt: z.string().min(10),
    capabilities: z.array(z.string()).optional(),
    temperature: z.number().optional(),
    maxTokens: z.number().optional()
});

export const updateAssistantSchema = z.object({
    name: z.string().min(3).optional(),
    model: z.string().min(3).optional(),
    systemPrompt: z.string().min(10).optional(),
    capabilities: z.array(z.string()).optional(),
    temperature: z.number().optional(),
    maxTokens: z.number().optional(),
    isActive: z.boolean().optional()
});
