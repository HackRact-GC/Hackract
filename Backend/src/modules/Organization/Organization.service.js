// src/modules/organization/organization.service.js
import organizationRepository from './Organization.repository.js';
import { OrganizationErrorCodes, VerificationStatus } from './Organization.constants.js';
import AppError from '../../utils/AppError.js';
// import prisma from '../../config/database.js';

class OrganizationService {
  async createOrganization(data, userId) {
    const userOrganizations = await this.getUserOrganizations(userId);
    if (userOrganizations.length >= 10) {
      throw new AppError('You have reached the maximum number of organizations', 400, 'MAX_ORGANIZATIONS_REACHED');
    }

    return await organizationRepository.createOrganization(data, userId);
  }

  async getOrganizationById(id, userId) {
    const organization = await organizationRepository.getOrganizationById(id, true);
    
    const isMember = await organizationRepository.isMember(id, userId);
    if (!isMember) {
      throw new AppError('Unauthorized access to organization', 403, OrganizationErrorCodes.UNAUTHORIZED);
    }

    return organization;
  }

  async getMyOrganizations(userId, filters) {
    const memberships = await prisma.organizationMember.findMany({
      where: { userId },
      include: {
        organization: {
          include: {
            _count: {
              select: {
                members: true,
                pentests: true
              }
            }
          }
        }
      },
      orderBy: { joinedAt: 'desc' }
    });

    const organizations = memberships.map(membership => ({
      ...membership.organization,
      role: membership.role,
      permissions: {
        canCreatePentests: membership.canCreatePentests,
        canInviteMembers: membership.canInviteMembers
      }
    }));

    let filtered = organizations;
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(org => 
        org.name.toLowerCase().includes(search) || 
        org.slug.toLowerCase().includes(search)
      );
    }

    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const paginated = filtered.slice(startIndex, endIndex);

    return {
      data: paginated,
      pagination: {
        page,
        limit,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / limit),
        hasNextPage: endIndex < filtered.length,
        hasPrevPage: startIndex > 0
      }
    };
  }

  async updateOrganization(id, data, userId) {
    const hasPermission = await organizationRepository.checkPermission(id, userId, 'manage_settings');
    if (!hasPermission) {
      throw new AppError('Unauthorized to update organization', 403, OrganizationErrorCodes.UNAUTHORIZED);
    }

    const organization = await organizationRepository.getOrganizationById(id);
    if ([VerificationStatus.UNDER_REVIEW, VerificationStatus.APPROVED].includes(organization.verificationStatus)) {
        // Allow updating but maybe reset status if critical fields change? 
        // For now, prevent update if approved to maintain integrity, or restrict fields.
        if (data.taxId || data.name) {
           throw new AppError('Verified or under-review organizations cannot change critical legal info.', 403);
        }
    }

    return await organizationRepository.updateOrganization(id, data);
  }

  async submitVerification(id, data, userId) {
    const hasPermission = await organizationRepository.checkPermission(id, userId, 'manage_settings');
    if (!hasPermission) {
      throw new AppError('Unauthorized to submit verification', 403, OrganizationErrorCodes.UNAUTHORIZED);
    }

    const organization = await organizationRepository.getOrganizationById(id);
    if (organization.verificationStatus === VerificationStatus.APPROVED) {
        return organization;
    }

    return await organizationRepository.updateOrganization(id, {
        ...data,
        verificationStatus: VerificationStatus.SUBMITTED
    });
  }

  async approveOrganization(id, adminId) {
    const organization = await organizationRepository.getOrganizationById(id);
    if (!organization) {
        throw new AppError('Organization not found', 404);
    }
    return await organizationRepository.updateOrganization(id, {
        verificationStatus: VerificationStatus.APPROVED
    });
  }

  async rejectOrganization(id, adminId) {
    const organization = await organizationRepository.getOrganizationById(id);
    if (!organization) {
        throw new AppError('Organization not found', 404);
    }
    return await organizationRepository.updateOrganization(id, {
        verificationStatus: VerificationStatus.REJECTED
    });
  }

  async deleteOrganization(id, userId) {
    const member = await prisma.organizationMember.findFirst({
      where: {
        organizationId: id,
        userId
      }
    });

    if (!member || member.role !== 'owner') {
      throw new AppError('Only organization owners can delete the organization', 403, OrganizationErrorCodes.UNAUTHORIZED);
    }

    return await organizationRepository.deleteOrganization(id);
  }

  async addMember(organizationId, data, userId) {
    const hasPermission = await organizationRepository.checkPermission(organizationId, userId, 'invite_members');
    if (!hasPermission) {
      throw new AppError('Unauthorized to add members', 403, OrganizationErrorCodes.UNAUTHORIZED);
    }

    return await organizationRepository.addMember(organizationId, data);
  }

  async getMembers(organizationId, filters, userId) {
    const isMember = await organizationRepository.isMember(organizationId, userId);
    if (!isMember) {
      throw new AppError('Unauthorized access', 403, OrganizationErrorCodes.UNAUTHORIZED);
    }

    return await organizationRepository.getMembers(organizationId, filters);
  }

  async updateMember(organizationId, memberId, data, userId) {
    const hasPermission = await organizationRepository.checkPermission(organizationId, userId, 'invite_members');
    if (!hasPermission) {
      throw new AppError('Unauthorized to update members', 403, OrganizationErrorCodes.UNAUTHORIZED);
    }

    return await organizationRepository.updateMember(organizationId, memberId, data);
  }

  async removeMember(organizationId, memberId, userId) {
    const hasPermission = await organizationRepository.checkPermission(organizationId, userId, 'invite_members');
    if (!hasPermission) {
      throw new AppError('Unauthorized to remove members', 403, OrganizationErrorCodes.UNAUTHORIZED);
    }

    const member = await organizationRepository.getMember(organizationId, memberId);
    if (member.role === 'owner') {
      const ownerCount = await prisma.organizationMember.count({
        where: {
          organizationId,
          role: 'owner'
        }
      });

      if (ownerCount <= 1) {
        throw new AppError('Cannot remove the only owner from organization', 400, 'CANNOT_REMOVE_ONLY_OWNER');
      }
    }

    return await organizationRepository.removeMember(organizationId, memberId);
  }

  async leaveOrganization(organizationId, userId) {
    const member = await prisma.organizationMember.findFirst({
      where: {
        organizationId,
        userId
      }
    });

    if (!member) {
      throw new AppError('You are not a member of this organization', 404, OrganizationErrorCodes.MEMBER_NOT_FOUND);
    }

    if (member.role === 'owner') {
      const ownerCount = await prisma.organizationMember.count({
        where: {
          organizationId,
          role: 'owner'
        }
      });

      if (ownerCount <= 1) {
        throw new AppError('Cannot leave as the only owner. Transfer ownership first.', 400, 'CANNOT_LEAVE_AS_ONLY_OWNER');
      }
    }

    return await organizationRepository.removeMember(organizationId, member.id);
  }

  async transferOwnership(organizationId, newOwnerId, userId) {
    const currentMember = await prisma.organizationMember.findFirst({
      where: {
        organizationId,
        userId
      }
    });

    if (!currentMember || currentMember.role !== 'owner') {
      throw new AppError('Only owners can transfer ownership', 403, OrganizationErrorCodes.UNAUTHORIZED);
    }

    const newOwnerMember = await prisma.organizationMember.findFirst({
      where: {
        organizationId,
        userId: newOwnerId
      }
    });

    if (!newOwnerMember) {
      throw new AppError('New owner is not a member of the organization', 404, OrganizationErrorCodes.MEMBER_NOT_FOUND);
    }

    return await prisma.$transaction(async (tx) => {
      await tx.organizationMember.update({
        where: { id: currentMember.id },
        data: {
          role: 'admin',
          canCreatePentests: true,
          canInviteMembers: true
        }
      });

      return await tx.organizationMember.update({
        where: { id: newOwnerMember.id },
        data: {
          role: 'owner',
          canCreatePentests: true,
          canInviteMembers: true
        }
      });
    });
  }

  async getStatistics(organizationId, userId) {
    const isMember = await organizationRepository.isMember(organizationId, userId);
    if (!isMember) {
      throw new AppError('Unauthorized access', 403, OrganizationErrorCodes.UNAUTHORIZED);
    }

    return await organizationRepository.getStatistics(organizationId);
  }

  async getUserOrganizations(userId) {
    const memberships = await prisma.organizationMember.findMany({
      where: { userId },
      include: {
        organization: true
      }
    });

    return memberships.map(membership => membership.organization);
  }

  async validateDomain(id, userId) {
    const organization = await this.getOrganizationById(id, userId);
    if (!organization.website) {
      throw new AppError('Organization website must be set before validation', 400, OrganizationErrorCodes.INVALID_DATA);
    }

    // Logic to verify domain (DNS/Meta) - Simulated for this architecture phase
    const isDomainValid = organization.website.includes('.'); // Basic format check
    
    if (!isDomainValid) {
       throw new AppError('Invalid domain format', 400, OrganizationErrorCodes.INVALID_DATA);
    }

    return {
      organizationId: id,
      domain: organization.website,
      status: 'VERIFIED',
      validatedAt: new Date()
    };
  }
}

export default new OrganizationService();