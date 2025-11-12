import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const createScanSession = async (data) => {
  return await prisma.scanSession.create({ data });
};

export const getAllSessions = async () => {
  return await prisma.scanSession.findMany({ include: { vulnerabilityFindings: true, aiAgentLogs: true } });
};

export const getSessionById = async (id) => {
  return await prisma.scanSession.findUnique({ where: { session_id: id }, include: { vulnerabilityFindings: true, aiAgentLogs: true } });
};

export const deleteSession = async (id) => {
  return await prisma.scanSession.delete({ where: { session_id: id } });
};
