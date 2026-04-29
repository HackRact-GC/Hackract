import Joi from 'joi';
import { VerificationStatus } from './hackerProfile.constants.js';

export const upsertHackerProfileSchema = Joi.object({
  bio: Joi.string().min(10).max(2000).required().messages({
    'string.empty': 'Bio is required',
    'string.min': 'Bio must be at least 10 characters long',
  }),
  country: Joi.string().max(100).optional().allow('', null),
  yearsOfExperience: Joi.number().integer().min(0).max(60).optional().allow(null, ''),
  primarySkills: Joi.alternatives()
    .try(
      Joi.array().items(Joi.string().max(50)).min(1),
      // Frontend sends comma-separated string — coerce it
      Joi.string().min(1),
    )
    .required(),
  certifications: Joi.alternatives()
    .try(
      Joi.array().items(Joi.string().max(100)),
      Joi.string().allow('', null),
    )
    .optional()
    .default([]),
  portfolioLinks: Joi.alternatives()
    .try(
      Joi.array().items(Joi.string().max(300)),
      Joi.string().allow('', null),
    )
    .optional()
    .default([]),

  // Extended identity fields (optional)
  idDocumentNumber: Joi.string().max(50).optional().allow('', null),
  githubUsername: Joi.string().max(100).optional().allow('', null),
  linkedinProfile: Joi.string().max(300).optional().allow('', null),

  status: Joi.string()
    .valid(VerificationStatus.DRAFT, VerificationStatus.SUBMITTED)
    .optional(),
});
