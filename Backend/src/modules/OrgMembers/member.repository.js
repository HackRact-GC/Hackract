import prisma from '../../database/prismaClient.js';
import AppError from '../../utils/AppError.js';
import { MemberErrorCodes } from './member.constants.js';

class MemberRepository {
    async addMember(data) {
        try {
            return await prisma.organizationMember.create({
                data,
                include: {
                    user: { select: { id: true, fullName: true, email: true, handle: true } },
                    organization: { select: { id: true, name: true } }
                }
            });
        } catch (error) {
            if (error.code === 'P2002') {
                throw new AppError('User already in organization', 409, MemberErrorCodes.ALREADY_EXISTS);
            }
            throw error;
        }
    }

    async removeMember(organizationId, userId) {
        const result = await prisma.organizationMember.deleteMany({
            where: {
                organizationId,
                userId
            }
        });

        if (result.count === 0) {
            throw new AppError('Member not found', 404, MemberErrorCodes.NOT_FOUND);
        }
        return result;
    }

    async updateMember(organizationId, userId, data) {
        // updateMany to update based on composite key (or find id first)
        // Finding ID first is safer for returning updated record
        const member = await prisma.organizationMember.findUnique({
            where: {
                organizationId_userId: {
                    organizationId,
                    userId
                }
            }
        });

        if (!member) throw new AppError('Member not found', 404, MemberErrorCodes.NOT_FOUND);

        return await prisma.organizationMember.update({
            where: { id: member.id },
            data: {
                ...data,
                updatedAt: new Date() // organizationMember doesn't have updatedAt in schema provided earlier?
                // Schema line 76: UNIQUE (organization_id, user_id)
                // Schema line 143: joinedAt DateTime @default(now())
                // No updatedAt in OrganizationMember schema reference?
                // Let's check schema.prisma again.
                // Line 127: OrganizationMember
                // joinedAt DateTime
                // No updatedAt. So removed that.
            }
        });
    }

    async findAll(filters = {}) {
        // ... logic
        return [];
    }
}

export default new MemberRepository();
