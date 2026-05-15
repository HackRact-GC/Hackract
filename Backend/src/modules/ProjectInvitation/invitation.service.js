import prisma from '../../database/prismaClient.js';
import AppError from '../../utils/AppError.js';
import invitationRepository from './invitation.repository.js';
import { InvitationErrorCodes, InvitationActions } from './invitation.constants.js';
import { logAction } from '../AuditLogs/auditLog.service.js';

// ─── Guards ──────────────────────────────────────────────────────────────────

const checkProjectManagePermission = async (pentestId, user) => {
    // 1. Global ORG_ADMIN
    if (user.roles.some(r => r.type === 'ORG_ADMIN')) return true;

    const pentest = await prisma.pentest.findUnique({
        where: { id: pentestId },
        select: { id: true, organizationId: true, leadPentesterId: true }
    });
    if (!pentest) throw new AppError('Project not found', 404, InvitationErrorCodes.PROJECT_NOT_FOUND);

    // 2. Org Member (Owner/Admin)
    if (pentest.organizationId) {
        const orgMember = await prisma.organizationMember.findFirst({
            where: { organizationId: pentest.organizationId, userId: user.id, role: { in: ['owner', 'admin'] } }
        });
        if (orgMember) return true;
    }

    // 3. Project Lead
    if (pentest.leadPentesterId === user.id) return true;

    // 4. Project Admin Collaborator
    const isProjectAdmin = await prisma.pentestCollaborator.findFirst({
        where: { pentestId, userId: user.id, role: 'PROJECT_ADMIN' }
    });
    if (isProjectAdmin) return true;

    throw new AppError('You do not have permission to manage this project', 403);
};

const ensurePentestExists = async (pentestId) => {
    const pentest = await prisma.pentest.findUnique({
        where: { id: pentestId },
        select: { id: true, organizationId: true },
    });
    if (!pentest) throw new AppError('Project not found', 404, InvitationErrorCodes.PROJECT_NOT_FOUND);
    return pentest;
};

const ensureHackerExists = async (hackerId) => {
    const user = await prisma.user.findUnique({
        where: { id: hackerId },
        select: { id: true, fullName: true, handle: true },
    });
    if (!user) throw new AppError('Hacker not found', 404, InvitationErrorCodes.HACKER_NOT_FOUND);
    return user;
};

const ensureHackerApproved = async (hackerId) => {
    const profile = await prisma.hackerProfile.findUnique({
        where: { userId: hackerId },
        select: { status: true },
    });
    if (!profile || profile.status !== 'APPROVED') {
        throw new AppError(
            'This hacker\'s profile has not been approved yet',
            403,
            InvitationErrorCodes.HACKER_NOT_APPROVED
        );
    }
};

// ─── Service Functions ────────────────────────────────────────────────────────

/**
 * Organization sends an invitation to a hacker for a specific pentest.
 */
export const sendInvitation = async (inviterId, { pentestId, hackerId, message, expiresAt }, req) => {
    const user = req.user; // We assume controller passes user or attaches to req
    await checkProjectManagePermission(pentestId, user);
    await ensureHackerExists(hackerId);

    // Block duplicate PENDING invitation
    const existing = await invitationRepository.findPending(pentestId, hackerId);
    if (existing) {
        throw new AppError(
            'This hacker already has a pending invitation for this project',
            409,
            InvitationErrorCodes.ALREADY_PENDING
        );
    }

    const invitation = await invitationRepository.create({
        pentestId,
        hackerId,
        invitedById: inviterId,
        message: message || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        status: 'PENDING',
    });

    await logAction(InvitationActions.SENT, inviterId, {
        invitationId: invitation.id,
        pentestId,
        hackerId,
        organizationId: invitation.pentest?.organization?.id,
    }, req);

    return invitation;
};

/**
 * Hacker accepts or rejects an invitation. On ACCEPTED, also creates a PentestCollaborator record.
 */
export const respondToInvitation = async (invitationId, hackerId, status, req) => {
    const invitation = await invitationRepository.findById(invitationId);

    if (!invitation) {
        throw new AppError('Invitation not found', 404, InvitationErrorCodes.NOT_FOUND);
    }

    // Ensure this invitation belongs to this hacker
    if (invitation.hackerId !== hackerId) {
        throw new AppError('You are not authorized to respond to this invitation', 403, InvitationErrorCodes.NOT_AUTHORIZED);
    }

    // Must still be PENDING
    if (invitation.status !== 'PENDING') {
        throw new AppError(
            `Invitation has already been ${invitation.status.toLowerCase()}`,
            409,
            InvitationErrorCodes.ALREADY_RESPONDED
        );
    }

    // Check expiry
    if (invitation.expiresAt && new Date() > new Date(invitation.expiresAt)) {
        await invitationRepository.updateStatus(invitationId, 'EXPIRED', { respondedAt: new Date() });
        throw new AppError('This invitation has expired', 410, InvitationErrorCodes.EXPIRED);
    }

    const updated = await invitationRepository.updateStatus(invitationId, status, {
        respondedAt: new Date(),
    });

    // On acceptance → add to pentest as collaborator (if not already there)
    if (status === 'ACCEPTED') {
        const alreadyCollaborator = await prisma.pentestCollaborator.findUnique({
            where: { pentestId_userId: { pentestId: invitation.pentestId, userId: hackerId } },
        });

        if (!alreadyCollaborator) {
            await prisma.pentestCollaborator.create({
                data: {
                    pentestId: invitation.pentestId,
                    userId: hackerId,
                    role: 'HACKER',
                },
            });
        }

        // Auto-create PENDING ProjectAgreementAcceptance for the hacker
        const activeAgreement = await prisma.projectAgreement.findFirst({
            where: { pentestId: invitation.pentestId, isActive: true },
            orderBy: { version: 'desc' }
        });

        if (activeAgreement) {
            const alreadyAccepted = await prisma.projectAgreementAcceptance.findUnique({
                where: { agreementId_hackerId: { agreementId: activeAgreement.id, hackerId } }
            });

            if (!alreadyAccepted) {
                await prisma.projectAgreementAcceptance.create({
                    data: {
                        agreementId: activeAgreement.id,
                        hackerId,
                        pentestId: invitation.pentestId,
                        version: activeAgreement.version,
                        status: 'PENDING'
                    }
                });
            }
        }
    }

    const actionKey = status === 'ACCEPTED' ? InvitationActions.ACCEPTED : InvitationActions.REJECTED;
    await logAction(actionKey, hackerId, {
        invitationId,
        pentestId: invitation.pentestId,
    }, req);

    return updated;
};

/**
 * Organization revokes a PENDING invitation.
 */
export const revokeInvitation = async (invitationId, userId, req) => {
    const invitation = await invitationRepository.findById(invitationId);

    if (!invitation) {
        throw new AppError('Invitation not found', 404, InvitationErrorCodes.NOT_FOUND);
    }

    await checkProjectManagePermission(invitation.pentestId, req.user);

    if (invitation.status !== 'PENDING') {
        throw new AppError(
            `Cannot revoke an invitation that is already ${invitation.status.toLowerCase()}`,
            409,
            InvitationErrorCodes.CANNOT_REVOKE
        );
    }

    const updated = await invitationRepository.updateStatus(invitationId, 'REVOKED');

    await logAction(InvitationActions.REVOKED, userId, {
        invitationId,
        pentestId: invitation.pentestId,
        hackerId: invitation.hackerId,
    }, req);

    return updated;
};

/**
 * List all invitations for a project (org view).
 */
export const listProjectInvitations = async (pentestId, filters, user) => {
    await checkProjectManagePermission(pentestId, user);
    return invitationRepository.listForPentest(pentestId, filters);
};

/**
 * List invitations received by the authenticated hacker.
 */
export const listMyInvitations = async (hackerId, filters) => {
    return invitationRepository.listForHacker(hackerId, filters);
};

/**
 * Count pending invitations for a hacker (used for notification badge).
 */
export const countPendingInvitations = async (hackerId) => {
    return invitationRepository.countPendingForHacker(hackerId);
};
