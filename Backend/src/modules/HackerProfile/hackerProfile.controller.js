import * as service from './hackerProfile.service.js';
import ApiResponse from '../../utils/ApiResponse.js';
import { VerificationStatus } from './hackerProfile.constants.js';

export const getMe = async (req, res, next) => {
  try {
    const profile = await service.getMyProfile(req.user.id);
    ApiResponse.success(res, { profile }, 'Hacker profile retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const upsertMe = async (req, res, next) => {
  try {
    const profile = await service.upsertMyProfile(req.user.id, req.validatedBody || req.body);
    ApiResponse.success(res, { profile }, 'Hacker profile saved successfully');
  } catch (error) {
    next(error);
  }
};

export const submitMe = async (req, res, next) => {
  try {
    const profile = await service.submitMyProfile(req.user.id);
    ApiResponse.success(res, { profile }, 'Hacker profile submitted for review');
  } catch (error) {
    next(error);
  }
};

export const listForReview = async (req, res, next) => {
  try {
    const status = req.query.status;
    const validStatus = Object.values(VerificationStatus);
    const statusFilter = status && validStatus.includes(status) ? status : undefined;
    const profiles = await service.listProfilesForReview(statusFilter);
    ApiResponse.success(res, { profiles }, 'Hacker profiles retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const approve = async (req, res, next) => {
  try {
    const updated = await service.reviewProfile(req.params.id, req.user.id, 'approve', req.body?.notes);
    ApiResponse.success(res, { profile: updated }, 'Hacker profile approved');
  } catch (error) {
    next(error);
  }
};

export const reject = async (req, res, next) => {
  try {
    const updated = await service.reviewProfile(req.params.id, req.user.id, 'reject', req.body?.notes);
    ApiResponse.success(res, { profile: updated }, 'Hacker profile rejected');
  } catch (error) {
    next(error);
  }
};
export const getStatus = async (req, res, next) => {
  try {
    const profile = await service.getMyProfile(req.user.id);
    const missing = await service.getMissingAgreements(req.user.id);
    ApiResponse.success(res, { profile, missingAgreements: missing }, 'Verification status retrieved');
  } catch (error) {
    next(error);
  }
};

export const signAgreement = async (req, res, next) => {
  try {
    const { agreementTitle } = req.body;
    const meta = { ipAddress: req.ip, userAgent: req.get('user-agent') };
    const signature = await service.signAgreement(req.user.id, agreementTitle, meta);
    ApiResponse.success(res, { signature }, 'Agreement signed successfully');
  } catch (error) {
    next(error);
  }
};
