import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const createLog = async (data) => prisma.aIAgentLog.create({ data });
export const getLogsBySession = async (session_id) => prisma.aIAgentLog.findMany({ where: { session_id } });
