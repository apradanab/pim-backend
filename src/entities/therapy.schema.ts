import Joi from 'joi';

export const therapyCreateDtoSchema = Joi.object({
  title: Joi.string().min(3).max(30).required(),
  description: Joi.string().min(10).required(),
  content: Joi.string().required(),
  image: Joi.string().uri().required(),
});

export const therapyUpdateDtoSchema = Joi.object({
  title: Joi.string().min(3).max(30).optional(),
  description: Joi.string().min(10).optional(),
  content: Joi.string().optional(),
  image: Joi.string().uri().optional(),
});
