// src/modules/organization/organization.service.js
import organizationRepository from './Organization.repository.js';
import { OrganizationErrorCodes, VerificationStatus } from './Organization.constants.js';
import AppError from '../../utils/AppError.js';
import prisma from '../../database/prismaClient.js';

const hasElevatedOrgAccess = (user) => {
  const roles = user?.roles?.map((r) => r.type) || [];
  return roles.includes('SUPER_ADMIN') || roles.includes('ORG_ADMIN');
};

class OrganizationService {
  async createOrganization(data, userId) {
    const userOrganizations = await this.getUserOrganizations(userId);
    if (userOrganizations.length >= 10) {
      throw new AppError('You have reached the maximum number of organizations', 400, 'MAX_ORGANIZATIONS_REACHED');
    }

    return await organizationRepository.createOrganization(data, userId);
  }

  async getOrganizationById(id, user) {
    const organization = await organizationRepository.getOrganizationById(id, true);

    if (hasElevatedOrgAccess(user)) {
      return organization;
    }

    const isMember = await organizationRepository.isMember(id, user.id);
    if (!isMember) {
      throw new AppError('Unauthorized access to organization', 403, OrganizationErrorCodes.UNAUTHORIZED);
    }

    return organization;
  }

  async updateOrganization(id, data, user) {
    if (hasElevatedOrgAccess(user)) {
      return organizationRepository.updateOrganization(id, data);
    }

    const hasPermission = await organizationRepository.checkPermission(id, user.id, 'manage_settings');
    if (!hasPermission) {
      throw new AppError('Unauthorized to update organization', 403, OrganizationErrorCodes.UNAUTHORIZED);
    }


    return organizationRepository.updateOrganization(id, data);
  }

  async deleteOrganization(id, user) {
    if (hasElevatedOrgAccess(user)) {
      return organizationRepository.deleteOrganization(id);
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

  async deleteOrganization(id, userId) {

    const member = await prisma.organizationMember.findFirst({
      where: {
        organizationId: id,
        userId: user.id
      }
    });

    if (!member || member.role !== 'owner') {
      throw new AppError('Only organization owners can delete the organization', 403, OrganizationErrorCodes.UNAUTHORIZED);
    }

    return organizationRepository.deleteOrganization(id);
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