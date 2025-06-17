import Joi from "joi";
import { type AppointmentCreateDto, type AppointmentUpdateDto } from "./appointment.js";

export const appointmentCreateDtoSchema = Joi.object<AppointmentCreateDto>({
  date: Joi.date().required(),
  startTime: Joi.date().required(),
  endTime: Joi.date().greater(Joi.ref('startTime')).required(),
  therapyId: Joi.string().uuid().required(),
  notes: Joi.string().optional(),
  adminNotes: Joi.string().optional(),
});

export const appointmentUpdateDtoSchema = Joi.object<AppointmentUpdateDto>({
  status: Joi.string()
    .valid( 'AVAILABLE', 'PENDING', 'OCCUPIED', 'COMPLETED', 'CANCELLED')
    .optional(),
  notes: Joi.string()
    .allow(null, '')
    .when('status', { is: 'CANCELLED', then: Joi.required() }),
  adminNotes: Joi.string().allow(null, ''),
});
