import prisma from '../../database/prismaClient.js';
import AppError from '../../utils/AppError.js';
import { HackerProfileErrorCodes, VerificationStatus } from './hackerProfile.constants.js';
import { calculateTrustScore } from '../user/user.service.js';

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Coerce a value that may be a comma-separated string or array into a clean array.
 */
const toArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(s => String(s).trim()).filter(Boolean);
  return String(value).split(',').map(s => s.trim()).filter(Boolean);
};

// ─── Service Functions ───────────────────────────────────────────────────────

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

  const nextStatus = payload.status === VerificationStatus.SUBMITTED
    ? VerificationStatus.SUBMITTED
    : (existing?.status || VerificationStatus.DRAFT);

  const data = {
    bio: payload.bio,
    country: payload.country || null,
    yearsOfExperience: payload.yearsOfExperience ? Number(payload.yearsOfExperience) : null,
    primarySkills: toArray(payload.primarySkills),
    certifications: toArray(payload.certifications),
    employment: toArray(payload.employment),
    otherExperiences: toArray(payload.otherExperiences),
    portfolioLinks: toArray(payload.portfolioLinks),

    // Extended identity fields
    specialization: payload.specialization || null,
    githubUsername: payload.githubUsername || null,
    linkedinProfile: payload.linkedinProfile || null,
    twitter: payload.twitter || null,
    idDocumentNumber: payload.idDocumentNumber || null,

    status: nextStatus,
  };

  const profile = await prisma.hackerProfile.upsert({
    where: { userId },
    create: { userId, ...data },
    update: data,
  });

  // Also update the User's full name and avatar if provided in the payload
  if (payload.fullName || payload.avatar) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        ...(payload.fullName && { fullName: payload.fullName }),
        ...(payload.avatar && { avatar: payload.avatar }),
      },
    });
  }

  await calculateTrustScore(userId);

  return profile;
};

/**
 * Submit the hacker profile for platform review.
 * NDA agreements are NO LONGER required at this stage —
 * they are only enforced when applying to an organization project.
 */
export const submitMyProfile = async (userId) => {
  const profile = await prisma.hackerProfile.findUnique({ where: { userId } });
  if (!profile) {
    throw new AppError('Hacker profile not found', 404, HackerProfileErrorCodes.NOT_FOUND);
  }

  if (profile.status === VerificationStatus.APPROVED) {
    return profile;
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

/**
 * Check which mandatory agreements the user has NOT yet signed.
 * Used only for informational display — no longer blocks profile submission.
 */
export const getMissingAgreements = async (userId) => {
  const mandatoryAgreements = ['Mutual Non-Disclosure Agreement (MNDA)', 'Ethical Hacking Code of Conduct'];

  const signedAgreements = await prisma.userSignature.findMany({
    where: { userId },
    include: { agreement: true },
  });

  const signedTitles = signedAgreements.map(s => s.agreement.title);
  return mandatoryAgreements.filter(title => !signedTitles.includes(title));
};

/**
 * Sign a specific agreement by title (used from the onboarding UI).
 */
export const signAgreement = async (userId, agreementTitle, meta = {}) => {
  const agreement = await prisma.legalAgreement.findFirst({
    where: { title: agreementTitle, isActive: true },
    orderBy: { version: 'desc' },
  });

  if (!agreement) {
    throw new AppError('Agreement not found or inactive', 404);
  }

  const signature = await prisma.userSignature.upsert({
    where: {
      userId_agreementId: { userId, agreementId: agreement.id },
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
    },
  });

  return signature;
};

export const reviewProfile = async (profileId, reviewerId, action, notes) => {
  const profile = await prisma.hackerProfile.findUnique({ where: { id: profileId } });
  if (!profile) {
    throw new AppError('Hacker profile not found', 404, HackerProfileErrorCodes.NOT_FOUND);
  }

  const newStatus = action === 'approve'
    ? VerificationStatus.APPROVED
    : VerificationStatus.REJECTED;

  const updated = await prisma.hackerProfile.update({
    where: { id: profileId },
    data: {
      status: newStatus,
      reviewNotes: notes || null,
      reviewedById: reviewerId,
    },
  });

  await calculateTrustScore(profile.userId);
  return updated;
};
