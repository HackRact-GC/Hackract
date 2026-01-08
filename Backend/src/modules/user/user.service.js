import bcrypt from 'bcrypt';
import userRepository from './user.repository.js';
import AppError from '../../utils/AppError.js';
import { UserErrorCodes } from './user.constants.js';

const SALT_ROUNDS = 12;

/**
 * Get user by ID
 */
export const getUserById = async (userId) => {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404, UserErrorCodes.NOT_FOUND);
  }
  const { passwordHash, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

/**
 * Get all users with filters
 */
export const getAllUsers = async (filters) => {
  return await userRepository.findAll(filters);
};

/**
 * Update user profile
 */
export const updateProfile = async (userId, data) => {
  // Remove fields that shouldn't be updated via this endpoint
  const { passwordHash, status, isVerified, roles, provider, providerId, ...allowedData } = data;

  const user = await userRepository.updateUser(userId, allowedData);
  const { passwordHash: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

/**
 * Change password
 */
export const changePassword = async (userId, { oldPassword, newPassword }) => {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404, UserErrorCodes.NOT_FOUND);
  }

  if (!user.passwordHash) {
    throw new AppError(
      'Cannot change password for OAuth accounts',
      400,
      UserErrorCodes.OAUTH_ACCOUNT,
      { provider: user.provider }
    );
  }

  const isValidPassword = await bcrypt.compare(oldPassword, user.passwordHash);
  if (!isValidPassword) {
    throw new AppError(
      'Current password is incorrect',
      400,
      UserErrorCodes.OLD_PASSWORD_INCORRECT
    );
  }

  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await userRepository.updateUser(userId, { passwordHash: hashedPassword });

  return { message: 'Password updated successfully' };
};

/**
 * Update account status (Admin only)
 */
export const updateAccountStatus = async (userId, status) => {
  const validStatuses = ['PENDING', 'ACTIVE', 'SUSPENDED', 'BANNED'];
  if (!validStatuses.includes(status)) {
    throw new AppError(
      `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      400,
      UserErrorCodes.INVALID_STATUS
    );
  }

  const user = await userRepository.updateUser(userId, { status });
  const { passwordHash, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

/**
 * Deactivate account (soft delete)
 */
export const deactivateAccount = async (userId) => {
  await userRepository.updateUser(userId, { status: 'SUSPENDED' });
  return { message: 'Account deactivated successfully' };
};

/**
 * Delete account permanently
 */
export const deleteAccount = async (userId) => {
  await userRepository.deleteUser(userId);
  return { message: 'Account deleted permanently' };
};
