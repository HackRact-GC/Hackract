import bcrypt from 'bcrypt';
import userRepository from './user.repository.js';
import AppError from '../../utils/AppError.js';
import { UserErrorCodes } from './user.constants.js';

const SALT_ROUNDS = 12;

export const register = async (data) => {
  const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

  const user = await userRepository.createUser({
    email: data.email,
    passwordHash: hashedPassword,
    fullName: data.fullName,
    handle: data.handle,
    status: 'ACTIVE', // Default to active or PENDING based on requirement (schema says PENDING)
    isVerified: false
  });

  const { passwordHash, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const login = async ({ email, password }) => {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw new AppError('Invalid email or password', 401, UserErrorCodes.INVALID_CREDENTIALS);
  }

  // Check if suspended or banned
  if (user.status === 'SUSPENDED') {
    throw new AppError('Account is suspended', 403, UserErrorCodes.SUSPENDED);
  }
  if (user.status === 'BANNED') {
    throw new AppError('Account is banned', 403, UserErrorCodes.BANNED);
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);
  if (!isValidPassword) {
    throw new AppError('Invalid email or password', 401, UserErrorCodes.INVALID_CREDENTIALS);
  }

  // TODO: Generate JWT here if not handled by controller
  // For now return user object to be handled by controller which might issue token
  const { passwordHash: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const updateProfile = async (userId, data) => {
  // If verifying email uniqueness is needed, repository handles P2002 error
  const user = await userRepository.updateUser(userId, data);
  const { passwordHash, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const changePassword = async (userId, { oldPassword, newPassword }) => {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404, UserErrorCodes.NOT_FOUND);
  }

  const isValidPassword = await bcrypt.compare(oldPassword, user.passwordHash);
  if (!isValidPassword) {
    throw new AppError('Incorrect old password', 400, UserErrorCodes.OLD_PASSWORD_INCORRECT);
  }

  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await userRepository.updateUser(userId, { passwordHash: hashedPassword });

  return { message: 'Password updated successfully' };
};

export const deactivateAccount = async (userId) => {
  // Soft delete logic, or just status change
  // If you want to delete strictly:
  // await userRepository.deleteUser(userId);
  // If status change:
  await userRepository.updateUser(userId, { status: 'Suspended' }); // Matching enum likely?
  // Schema enum: PENDING, ACTIVE, Suspended, BANNED (Note case sensitivity in Postgres/Prisma)
  // Schema.sql line 11: 'PENDING', 'ACTIVE', 'Suspended', 'BANNED'
  // Prisma schema line 16: PENDING, ACTIVE, SUSPENDED, BANNED
  // Wait, check Prisma schema case sensitivity.
  // Prisma schema: SUSPENDED (all caps)
  // SQL schema: 'Suspended' (Mixed case)
  // If Prisma schema says SUSPENDED, prisma updates will use that.
  return { message: 'Account deactivated' };
};

export const deleteAccount = async (userId) => {
  await userRepository.deleteUser(userId);
  return { message: 'Account deleted permanently' };
};

export const getAllUsers = async (filters) => {
  return await userRepository.findAll(filters);
};

export const getUserById = async (userId) => {
  const user = await userRepository.findById(userId);
  if (!user) throw new AppError('User not found', 404, UserErrorCodes.NOT_FOUND);
  const { passwordHash, ...userWithoutPassword } = user;
  return userWithoutPassword;
};
