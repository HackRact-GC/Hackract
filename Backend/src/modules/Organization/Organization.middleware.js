// src/modules/organization/organization.middleware.js
import organizationRepository from './Organization.repository.js';
import AppError from '../../utils/AppError.js';
// import prisma from '../../config/database.js';

export const isOrganizationMember = async (req, res, next) => {
  try {
    const organizationId = req.params.organizationId;
    
    if (!organizationId) {
      return next(new AppError('Organization ID is required', 400));
    }

    const isMember = await organizationRepository.isMember(organizationId, req.user.id);
    
    if (!isMember) {
      return next(new AppError('You are not a member of this organization', 403));
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const hasOrganizationPermission = (permission) => {
  return async (req, res, next) => {
    try {
      const organizationId = req.params.organizationId;
      
      if (!organizationId) {
        return next(new AppError('Organization ID is required', 400));
      }

      const hasPermission = await organizationRepository.checkPermission(
        organizationId,
        req.user.id,
        permission
      );

      if (!hasPermission) {
        return next(new AppError('You do not have permission to perform this action', 403));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const isOrganizationAdmin = async (req, res, next) => {
  try {
    const organizationId = req.params.organizationId;
    
    if (!organizationId) {
      return next(new AppError('Organization ID is required', 400));
    }

    const member = await prisma.organizationMember.findFirst({
      where: {
        organizationId,
        userId: req.user.id,
        OR: [
          { role: 'owner' },
          { role: 'admin' }
        ]
      }
    });

    if (!member) {
      return next(new AppError('You must be an admin or owner to perform this action', 403));
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const isOrganizationOwner = async (req, res, next) => {
  try {
    const organizationId = req.params.organizationId;
    
    if (!organizationId) {
      return next(new AppError('Organization ID is required', 400));
    }

    const member = await prisma.organizationMember.findFirst({
      where: {
        organizationId,
        userId: req.user.id,
        role: 'owner'
      }
    });

    if (!member) {
      return next(new AppError('You must be an owner to perform this action', 403));
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const loadOrganization = async (req, res, next) => {
  try {
    const organizationId = req.params.organizationId;
    
    if (!organizationId) {
      return next(new AppError('Organization ID is required', 400));
    }

    const organization = await prisma.organization.findUnique({
      where: { id: organizationId }
    });

    if (!organization) {
      return next(new AppError('Organization not found', 404));
    }

    req.organization = organization;
    next();
  } catch (error) {
    next(error);
  }
};