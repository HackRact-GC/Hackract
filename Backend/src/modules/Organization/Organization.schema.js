// src/modules/organization/organization.schema.js
import Joi from 'joi';
import { OrganizationRole } from './Organization.constants.js';

export const createOrganizationSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .pattern(/^[a-zA-Z0-9\s\-&.]+$/)
    .required()
    .messages({
      'string.min': 'Organization name must be at least 2 characters',
      'string.max': 'Organization name cannot exceed 100 characters',
      'string.pattern.base': 'Organization name can only contain letters, numbers, spaces, hyphens, ampersands, and periods',
      'any.required': 'Organization name is required'
    }),
  slug: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^[a-z0-9\-]+$/)
    .optional()
    .messages({
      'string.min': 'Slug must be at least 2 characters',
      'string.max': 'Slug cannot exceed 50 characters',
      'string.pattern.base': 'Slug can only contain lowercase letters, numbers, and hyphens'
    }),
  description: Joi.string()
    .max(500)
    .optional()
    .messages({
      'string.max': 'Description cannot exceed 500 characters'
    }),
  industry: Joi.string().max(100).optional(),
  size: Joi.string().max(50).optional(),
  website: Joi.string().uri().optional(),
  primaryEmail: Joi.string().email().optional(),
  phoneNumber: Joi.string().max(20).optional(),
  addressLine1: Joi.string().max(255).optional(),
  addressLine2: Joi.string().max(255).optional(),
  city: Joi.string().max(100).optional(),
  state: Joi.string().max(100).optional(),
  postalCode: Joi.string().max(20).optional(),
  country: Joi.string().max(100).optional(),
  timezone: Joi.string().max(100).optional(),
  currency: Joi.string().max(10).optional(),
  registrationNumber: Joi.string().max(100).optional(),
  taxId: Joi.string().max(100).optional()
});

export const updateOrganizationSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .pattern(/^[a-zA-Z0-9\s\-&.]+$/)
    .optional()
    .messages({
      'string.min': 'Organization name must be at least 2 characters',
      'string.max': 'Organization name cannot exceed 100 characters',
      'string.pattern.base': 'Organization name can only contain letters, numbers, spaces, hyphens, ampersands, and periods'
    }),
  slug: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^[a-z0-9\-]+$/)
    .optional()
    .messages({
      'string.min': 'Slug must be at least 2 characters',
      'string.max': 'Slug cannot exceed 50 characters',
      'string.pattern.base': 'Slug can only contain lowercase letters, numbers, and hyphens'
    }),
  description: Joi.string()
    .max(500)
    .optional()
    .messages({
      'string.max': 'Description cannot exceed 500 characters'
    }),

  industry: Joi.string().max(100).optional(),
  size: Joi.string().max(50).optional(),
  website: Joi.string().uri().optional(),
  primaryEmail: Joi.string().email().optional(),
  phoneNumber: Joi.string().max(20).optional(),
  addressLine1: Joi.string().max(255).optional(),
  addressLine2: Joi.string().max(255).optional(),
  city: Joi.string().max(100).optional(),
  state: Joi.string().max(100).optional(),
  postalCode: Joi.string().max(20).optional(),
  country: Joi.string().max(100).optional(),
  timezone: Joi.string().max(100).optional(),
  currency: Joi.string().max(10).optional(),
  registrationNumber: Joi.string().max(100).optional(),
  taxId: Joi.string().max(100).optional()

}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});


export const submitVerificationSchema = Joi.object({
  taxId: Joi.string().required(),
  industry: Joi.string().required(),
  companySize: Joi.string().required(),
  website: Joi.string().uri().required(),
  address: Joi.string().required(),
});

export const addMemberSchema = Joi.object({
  userId: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.guid': 'Invalid user ID format',
      'any.required': 'User ID is required'
    }),
    
  role: Joi.string()
    .valid(...Object.values(OrganizationRole))
    .default(OrganizationRole.MEMBER)
    .messages({
      'any.only': 'Invalid role'
    }),
  canCreatePentests: Joi.boolean()
    .default(false),
  canInviteMembers: Joi.boolean()
    .default(false)
});

export const updateMemberSchema = Joi.object({
  role: Joi.string()
    .valid(...Object.values(OrganizationRole))
    .optional()
    .messages({
      'any.only': 'Invalid role'
    }),
  canCreatePentests: Joi.boolean()
    .optional(),
  canInviteMembers: Joi.boolean()
    .optional()
}).min(1).messages({
  'object.min': 'At least one field must be provided for member update'
});

export const paginationSchema = Joi.object({
  page: Joi.number()
    .integer()
    .positive()
    .default(1)
    .messages({
      'number.base': 'Page must be a number',
      'number.positive': 'Page must be positive'
    }),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(20)
    .messages({
      'number.base': 'Limit must be a number',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100'
    }),
  search: Joi.string()
    .max(100)
    .optional()
    .messages({
      'string.max': 'Search query cannot exceed 100 characters'
    }),
  sortBy: Joi.string()
    .valid('name', 'createdAt', 'updatedAt', 'memberCount')
    .default('createdAt')
    .messages({
      'any.only': 'Invalid sort field'
    }),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be either "asc" or "desc"'
    })
});

export const organizationIdSchema = Joi.object({
  organizationId: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.guid': 'Invalid organization ID format',
      'any.required': 'Organization ID is required'
    })
});

export const listOrganizationsQuerySchema = Joi.object({
  name: Joi.string().max(100).optional(),
  ownerName: Joi.string().max(100).optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20)
});

export const organizationNameQuerySchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20)
});

export const ownerNameQuerySchema = Joi.object({
  ownerName: Joi.string().min(1).max(100).required(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20)
});
export const memberIdSchema = Joi.object({
  organizationId: Joi.string().uuid().required(),
  memberId: Joi.string().uuid().required()
});
