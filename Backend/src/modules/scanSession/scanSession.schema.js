import Joi from "joi";

export const createScanSchema = Joi.object({
  user_id: Joi.string().uuid().required(),
  target_url: Joi.string().uri().required(),
});
