import Joi from 'joi';
import { VerificationStatus } from './hackerProfile.constants.js';

export const upsertHackerProfileSchema = Joi.object({
  bio: Joi.string().min(20).max(2000).required().messages({
    'string.empty': 'Bio is required',
    'string.min': 'Bio must be at least 20 characters long',
  }),
  country: Joi.string().max(100).optional().allow('', null),
  yearsOfExperience: Joi.number().integer().min(0).max(60).optional().allow(null),
  primarySkills: Joi.array().items(Joi.string().max(50)).min(1).required(),
  certifications: Joi.array().items(Joi.string().max(100)).optional().default([]),
  portfolioLinks: Joi.array()
    .items(
      Joi.string()
        .uri()
        .max(300)
        .messages({ 'string.uri': 'Portfolio links must be valid URLs' }),
    )
    .optional()
    .default([]),
  status: Joi.string()
    .valid(VerificationStatus.DRAFT, VerificationStatus.SUBMITTED)
    .optional(),
});
