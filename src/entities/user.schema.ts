import Joi from 'joi';
import { type UserCreateDto, type UserUpdateDto } from './user.js';


export const userCreateDtoSchema = Joi.object<UserCreateDto>({
  name: Joi.string().required(),
  email: Joi.string()
    .pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
    .required()
    .messages({
    'string.pattern.base': 'Please provide a valid email address.',
    'any.required': 'Email is required.',
  }),
  message: Joi.string().max(300).required().messages({
    'string.max': 'Message cannot exceed 300 characters.',
    'any.required': 'Message is required',
  }),
});

export const userUpdateDtoSchema = Joi.object<UserUpdateDto>({
  name: Joi.string(),
  email: Joi.string().email().messages({
    'string.email': 'Please provide a valid email address.',
  }),
  password: Joi.string().min(8).messages({
    'string.min': 'Password must be at least 8 characters long.',
  }),
  avatar: Joi.string(),
  approved: Joi.boolean().forbidden(),
})
