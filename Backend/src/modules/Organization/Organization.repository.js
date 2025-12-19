// src/modules/organization/organization.repository.js
// import prisma from '../../config/database.js';
import AppError from '../../utils/AppError.js';
import { OrganizationErrorCodes } from './Organization.constants.js';

class OrganizationRepository {
  async createOrganization(data, createdById) {
    try {
      return await prisma.$transaction(async (tx) => {
        let slug = data.slug;
        if (!slug) {
          slug = await this.generateSlug(data.name, tx);
        }

        const existing = await tx.organization.findUnique({
          where: { slug }
        });

        if (existing) {
          throw new AppError('Organization slug already taken', 400, OrganizationErrorCodes.SLUG_TAKEN);
        }

        const organization = await tx.organization.create({
          data: {
            name: data.name,
            slug: slug,
            description: data.description
          }
        });

        await tx.organizationMember.create({
          data: {
            organizationId: organization.id,
            userId: createdById,
            role: 'owner',
            canCreatePentests: true,
            canInviteMembers: true
          }
        });

        return organization;
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new AppError('Organization slug already exists', 400, OrganizationErrorCodes.SLUG_TAKEN);
      }
      throw error;
    }
  }

  async generateSlug(name, tx) {
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await tx.organization.findUnique({
        where: { slug }
      });

      if (!existing) {
        return slug;
      }

      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  async getOrganizationById(id, includeMembers = false) {
    const include = {
      _count: {
        select: {
          members: true,
          pentests: true
        }
      }
    };

    if (includeMembers) {
      include.members = {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
              handle: true,
              status: true
            }
          }
        }
      };
    }

    const organization = await prisma.organization.findUnique({
      where: { id },
      include
    });

    if (!organization) {
      throw new AppError('Organization not found', 404, OrganizationErrorCodes.NOT_FOUND);
    }

    return organization;
  }

  async getOrganizationBySlug(slug) {
    const organization = await prisma.organization.findUnique({
      where: { slug }
    });

    if (!organization) {
      throw new AppError('Organization not found', 404, OrganizationErrorCodes.NOT_FOUND);
    }

    return organization;
  }

  async getAllOrganizations(filters) {
    const {
      page = 1,
      limit = 20,
      search = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = filters;

    const skip = (page - 1) * limit;

    const where = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } }
      ]
    } : {};

    const [organizations, total] = await Promise.all([
      prisma.organization.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: {
            select: {
              members: true,
              pentests: true
            }
          }
        }
      }),
      prisma.organization.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: organizations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };
  }

  async updateOrganization(id, data) {
    try {
      return await prisma.organization.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date()
        }
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new AppError('Organization not found', 404, OrganizationErrorCodes.NOT_FOUND);
      }
      if (error.code === 'P2002') {
        throw new AppError('Organization slug already exists', 400, OrganizationErrorCodes.SLUG_TAKEN);
      }
      throw error;
    }
  }

  async deleteOrganization(id) {
    try {
      return await prisma.organization.delete({
        where: { id }
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new AppError('Organization not found', 404, OrganizationErrorCodes.NOT_FOUND);
      }
      throw error;
    }
  }

  async addMember(organizationId, data) {
    try {
      return await prisma.organizationMember.create({
        data: {
          organizationId,
          userId: data.userId,
          role: data.role || 'member',
          canCreatePentests: data.canCreatePentests || false,
          canInviteMembers: data.canInviteMembers || false
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
              handle: true
            }
          }
        }
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new AppError('Member already exists in organization', 400, OrganizationErrorCodes.MEMBER_EXISTS);
      }
      if (error.code === 'P2003') {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }
      throw error;
    }
  }

  async getMember(organizationId, memberId) {
    const member = await prisma.organizationMember.findFirst({
      where: {
        id: memberId,
        organizationId
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            handle: true
          }
        }
      }
    });

    if (!member) {
      throw new AppError('Member not found', 404, OrganizationErrorCodes.MEMBER_NOT_FOUND);
    }

    return member;
  }

  async getMembers(organizationId, filters) {
    const {
      page = 1,
      limit = 20,
      search = '',
      role = ''
    } = filters;

    const skip = (page - 1) * limit;

    const where = {
      organizationId
    };

    if (search) {
      where.user = {
        OR: [
          { email: { contains: search, mode: 'insensitive' } },
          { fullName: { contains: search, mode: 'insensitive' } },
          { handle: { contains: search, mode: 'insensitive' } }
        ]
      };
    }

    if (role) {
      where.role = role;
    }

    const [members, total] = await Promise.all([
      prisma.organizationMember.findMany({
        where,
        skip,
        take: limit,
        orderBy: { joinedAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
              handle: true,
              status: true
            }
          }
        }
      }),
      prisma.organizationMember.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: members,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };
  }

  async updateMember(organizationId, memberId, data) {
    try {
      return await prisma.organizationMember.update({
        where: {
          id: memberId
        },
        data: {
          ...data,
          updatedAt: new Date()
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
              handle: true
            }
          }
        }
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new AppError('Member not found', 404, OrganizationErrorCodes.MEMBER_NOT_FOUND);
      }
      throw error;
    }
  }

  async removeMember(organizationId, memberId) {
    try {
      return await prisma.organizationMember.delete({
        where: {
          id: memberId
        }
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new AppError('Member not found', 404, OrganizationErrorCodes.MEMBER_NOT_FOUND);
      }
      throw error;
    }
  }

  async isMember(organizationId, userId) {
    const member = await prisma.organizationMember.findFirst({
      where: {
        organizationId,
        userId
      }
    });

    return !!member;
  }

  async checkPermission(organizationId, userId, permission) {
    const member = await prisma.organizationMember.findFirst({
      where: {
        organizationId,
        userId
      }
    });

    if (!member) return false;

    if (permission === 'create_pentests') {
      return member.canCreatePentests;
    }
    if (permission === 'invite_members') {
      return member.canInviteMembers;
    }

    return true;
  }

  async getStatistics(organizationId) {
    const [membersCount, pentestsCount, findingsCount] = await Promise.all([
      prisma.organizationMember.count({
        where: { organizationId }
      }),
      prisma.pentest.count({
        where: { organizationId }
      }),
      prisma.finding.count({
        where: {
          pentest: {
            organizationId
          }
        }
      })
    ]);

    return {
      members: membersCount,
      pentests: pentestsCount,
      findings: findingsCount
    };
  }
}

export default new OrganizationRepository();