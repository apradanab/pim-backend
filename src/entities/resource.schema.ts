import Joi from "joi";

export const resourceCreateDtoSchema = Joi.object({
  title: Joi.string().min(3).max(30).required(),
  description: Joi.string().min(10).required(),
  content: Joi.string().required(),
  image: Joi.string().uri().required(),
  serviceId: Joi.string().uuid().required(),
});

export const resourceUpdateDtoSchema = Joi.object({
  title: Joi.string().min(3).max(30).optional(),
  description: Joi.string().min(10).optional(),
  content: Joi.string().optional(),
  image: Joi.string().uri().optional(),
});
