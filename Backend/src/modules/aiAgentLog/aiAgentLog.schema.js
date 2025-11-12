import Joi from "joi";

export const createLogSchema = Joi.object({
  session_id: Joi.string().uuid().required(),
  query: Joi.string().optional(),
  response: Joi.string().optional(),
  file_path: Joi.string().optional(),
  format: Joi.string().optional(),
});
