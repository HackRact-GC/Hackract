// src/modules/organization/organization.service.js
import organizationRepository from './Organization.repository.js';
import { OrganizationErrorCodes, VerificationStatus } from './Organization.constants.js';
import AppError from '../../utils/AppError.js';
import prisma from '../../database/prismaClient.js';

const isSuperAdmin = (user) => {
  const roles = user?.roles?.map((r) => r.type) || [];
  return roles.includes('SUPER_ADMIN');
};

const toPagination = ({ page = 1, limit = 20 } = {}) => {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(100, Math.max(1, Number(limit) || 20));
  return {
    skip: (safePage - 1) * safeLimit,
    take: safeLimit,
    page: safePage,
    limit: safeLimit,
  };
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

    if (isSuperAdmin(user)) {
      return organization;
    }

    const isMember = await organizationRepository.isMember(id, user.id);
    if (!isMember) {
      throw new AppError('Unauthorized access to organization', 403, OrganizationErrorCodes.UNAUTHORIZED);
    }

    return organization;
  }

  async updateOrganization(id, data, user) {
    if (isSuperAdmin(user)) {
      return organizationRepository.updateOrganization(id, data);
    }

    const hasPermission = await organizationRepository.checkPermission(id, user.id, 'manage_settings');
    if (!hasPermission) {
      throw new AppError('Unauthorized to update organization', 403, OrganizationErrorCodes.UNAUTHORIZED);
    }


    return organizationRepository.updateOrganization(id, data);
  }

  async deleteOrganization(id, user) {
    if (isSuperAdmin(user)) {
      return organizationRepository.deleteOrganization(id);
    }

    const member = await prisma.organizationMember.findFirst({
      where: {
        organizationId: id,
        userId: user.id,
        role: 'owner',
      },
    });

    if (!member) {
      throw new AppError('Only organization owners can delete the organization', 403, OrganizationErrorCodes.UNAUTHORIZED);
    }

    return organizationRepository.deleteOrganization(id);
  }

  async submitVerification(id, data, userId) {
    const organization = await organizationRepository.getOrganizationById(id);
    if (!organization) {
        throw new AppError('Organization not found', 404);
    }
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

  async listOrganizations(query, user) {
    const { skip, take, page, limit } = toPagination(query);
    const name = query?.name;
    const ownerName = query?.ownerName;

    const organizations = isSuperAdmin(user)
      ? await organizationRepository.listOrganizations({ name, ownerName, skip, take })
      : await organizationRepository.listOrganizationsForUser(user.id, { name, skip, take });

    return { organizations, page, limit };
  }

  async getOrganizationsByName(name, user, query = {}) {
    return this.listOrganizations({ ...query, name }, user);
  }

  async getOrganizationsByOwnerName(ownerName, user, query = {}) {
    if (!isSuperAdmin(user)) {
      throw new AppError('Only system admins can search organizations by owner', 403, OrganizationErrorCodes.UNAUTHORIZED);
    }
    return this.listOrganizations({ ...query, ownerName }, user);
  }

  async deleteAllOrganizations(user) {
    if (!isSuperAdmin(user)) {
      throw new AppError('Only system admins can delete all organizations', 403, OrganizationErrorCodes.UNAUTHORIZED);
    }

    const orgs = await prisma.organization.findMany({ select: { id: true } });
    let deletedCount = 0;
    for (const org of orgs) {
      await organizationRepository.deleteOrganization(org.id);
      deletedCount += 1;
    }

    return { deletedCount };
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
}

export default new OrganizationService();