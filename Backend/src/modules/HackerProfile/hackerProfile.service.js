import prisma from '../../database/prismaClient.js';
import AppError from '../../utils/AppError.js';
import { HackerProfileErrorCodes, HackerProfileStatus } from './hackerProfile.constants.js';

export const getMyProfile = async (userId) => {
  const profile = await prisma.hackerProfile.findUnique({
    where: { userId },
  });
  return profile;
};

export const upsertMyProfile = async (userId, payload) => {
  const existing = await prisma.hackerProfile.findUnique({ where: { userId } });

  if (existing && [HackerProfileStatus.UNDER_REVIEW, HackerProfileStatus.APPROVED].includes(existing.status)) {
    throw new AppError(
      'Approved or under-review profiles cannot be edited. Contact an administrator.',
      403,
      HackerProfileErrorCodes.FORBIDDEN_UPDATE,
    );
  }

  const nextStatus =
    payload.status && payload.status === HackerProfileStatus.SUBMITTED
      ? HackerProfileStatus.SUBMITTED
      : HackerProfileStatus.DRAFT;

  const data = {
    bio: payload.bio,
    country: payload.country || null,
    yearsOfExperience: payload.yearsOfExperience ?? null,
    primarySkills: payload.primarySkills,
    certifications: payload.certifications || [],
    portfolioLinks: payload.portfolioLinks || [],
    status: nextStatus,
  };

  const profile = await prisma.hackerProfile.upsert({
    where: { userId },
    create: {
      userId,
      ...data,
    },
    update: data,
  });

  return profile;
};

export const submitMyProfile = async (userId) => {
  const profile = await prisma.hackerProfile.findUnique({ where: { userId } });
  if (!profile) {
    throw new AppError('Hacker profile not found', 404, HackerProfileErrorCodes.NOT_FOUND);
  }
  if (profile.status === HackerProfileStatus.APPROVED) {
    return profile;
  }

  const updated = await prisma.hackerProfile.update({
    where: { userId },
    data: { status: HackerProfileStatus.SUBMITTED },
  });

  return updated;
};

export const listProfilesForReview = async (statusFilter) => {
  const where = statusFilter ? { status: statusFilter } : {};
  return prisma.hackerProfile.findMany({
    where,
    include: {
      user: {
        select: { id: true, email: true, fullName: true, handle: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const reviewProfile = async (profileId, reviewerId, action, notes) => {
  const profile = await prisma.hackerProfile.findUnique({ where: { id: profileId } });
  if (!profile) {
    throw new AppError('Hacker profile not found', 404, HackerProfileErrorCodes.NOT_FOUND);
  }

  const status =
    action === 'approve'
      ? HackerProfileStatus.APPROVED
      : action === 'reject'
      ? HackerProfileStatus.REJECTED
      : profile.status;

  const updated = await prisma.hackerProfile.update({
    where: { id: profileId },
    data: {
      status,
      reviewNotes: notes || null,
      reviewedById: reviewerId,
    },
  });

  return updated;
};

