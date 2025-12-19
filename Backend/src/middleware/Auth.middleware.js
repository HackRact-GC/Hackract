import jwt from 'jsonwebtoken';
import AppError from '../utils/AppError.js';
import prisma from '../database/prismaClient.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Not authorized to access this route', 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { roles: true } // Include roles for restrictTo
    });

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    if (user.status === 'SUSPENDED' || user.status === 'BANNED') {
      return next(new AppError('Account is suspended or banned', 403));
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token', 401));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Token expired', 401));
    }
    next(error);
  }
};

export const restrictTo = (...allowedRoles) => {
  return (req, res, next) => {
    // Check if user has at least one of the allowed roles
    const hasPermission = req.user.roles.some(role => allowedRoles.includes(role.type));

    if (!hasPermission) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }

    next();
  };
};