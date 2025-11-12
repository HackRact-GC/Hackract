import Joi from "joi";

export const loginSchema = Joi.object({
  user: Joi.object({
    sub: Joi.string().required(),
    email: Joi.string().email().required(),
    name: Joi.string().optional(),
    picture: Joi.string().uri().optional(),
  }).required(),
});

export const logoutSchema = Joi.object({
  user: Joi.object({
    sub: Joi.string().required(),
    email: Joi.string().email().required(),
  }).required(),
});

export const refreshSchema = Joi.object({
  user: Joi.object({
    sub: Joi.string().required(),
    email: Joi.string().email().required(),
  }).required(),
});
