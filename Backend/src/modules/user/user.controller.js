import * as service from "./user.service.js";
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema
} from "./user.schema.js";

export const register = async (req, res, next) => {
  try {
    res.status(201).json(await service.register(registerSchema.parse(req.body)));
  } catch (e) { next(e); }
};

export const login = async (req, res, next) => {
  try {
    res.json(await service.login(loginSchema.parse(req.body)));
  } catch (e) { next(e); }
};

export const me = (req, res) => res.json(req.user);

export const updateProfile = async (req, res, next) => {
  try {
    res.json(await service.updateProfile(
      req.user.id,
      updateProfileSchema.parse(req.body)
    ));
  } catch (e) { next(e); }
};

export const changePassword = async (req, res, next) => {
  try {
    res.json(await service.changePassword(
      req.user.id,
      changePasswordSchema.parse(req.body)
    ));
  } catch (e) { next(e); }
};

export const deactivate = async (req, res) => {
  res.json(await service.deactivateAccount(req.user.id));
};

export const remove = async (req, res) => {
  res.status(204).json(await service.deleteAccount(req.user.id));
};

export const listUsers = async (req, res) => {
  res.json(await service.getAllUsers());
};
