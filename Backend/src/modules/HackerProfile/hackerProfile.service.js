import prisma from '../../database/prismaClient.js';
import AppError from '../../utils/AppError.js';
import { HackerProfileErrorCodes, VerificationStatus } from './hackerProfile.constants.js';
import { calculateTrustScore } from '../user/user.service.js';

export const getMyProfile = async (userId) => {
  const profile = await prisma.hackerProfile.findUnique({
    where: { userId },
  });
  return profile;
};

export const upsertMyProfile = async (userId, payload) => {
  const existing = await prisma.hackerProfile.findUnique({ where: { userId } });

  if (existing && [VerificationStatus.UNDER_REVIEW, VerificationStatus.APPROVED].includes(existing.status)) {
    throw new AppError(
      'Approved or under-review profiles cannot be edited. Contact an administrator.',
      403,
      HackerProfileErrorCodes.FORBIDDEN_UPDATE,
    );
  }

  const nextStatus =
    payload.status && payload.status === VerificationStatus.SUBMITTED
      ? VerificationStatus.SUBMITTED
      : VerificationStatus.DRAFT;

  const data = {
    bio: payload.bio,
    idDocumentNumber: payload.idDocumentNumber || null,
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

  await calculateTrustScore(userId);

  return profile;
};

export const submitMyProfile = async (userId) => {
  const profile = await prisma.hackerProfile.findUnique({ where: { userId } });
  if (!profile) {
    throw new AppError('Hacker profile not found', 404, HackerProfileErrorCodes.NOT_FOUND);
  }
  if (profile.status === VerificationStatus.APPROVED) {
    return profile;
  }

  const missing = await getMissingAgreements(userId);
  if (missing.length > 0) {
    throw new AppError(`Mandatory legal agreements must be signed: ${missing.join(', ')}`, 400);
  }

  const updated = await prisma.hackerProfile.update({
    where: { userId },
    data: { status: VerificationStatus.SUBMITTED },
  });

  await calculateTrustScore(userId);

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

export const getMissingAgreements = async (userId) => {
  const mandatoryAgreements = ['Mutual Non-Disclosure Agreement (MNDA)', 'Ethical Hacking Code of Conduct'];

  const signedAgreements = await prisma.userSignature.findMany({
    where: { userId },
    include: { agreement: true }
  });

  const signedTitles = signedAgreements.map(s => s.agreement.title);
  return mandatoryAgreements.filter(title => !signedTitles.includes(title));
};

export const signAgreement = async (userId, agreementTitle, meta = {}) => {
  const agreement = await prisma.legalAgreement.findFirst({
    where: { title: agreementTitle, isActive: true },
    orderBy: { version: 'desc' }
  });

  if (!agreement) {
    throw new AppError('Agreement not found or inactive', 404);
  }

  const signature = await prisma.userSignature.upsert({
    where: {
      userId_agreementId: {
        userId,
        agreementId: agreement.id
      }
    },
    create: {
      userId,
      agreementId: agreement.id,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    },
    update: {
      signedAt: new Date(),
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    }
  });

  return signature;
};

