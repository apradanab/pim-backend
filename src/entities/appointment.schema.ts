import Joi from "joi";
import { type AppointmentCreateDto, type AppointmentUpdateDto } from "./appointment.js";

export const appointmentCreateDtoSchema = Joi.object<AppointmentCreateDto>({
  date: Joi.date().required(),
  startTime: Joi.date().required(),
  endTime: Joi.date().greater(Joi.ref('startTime')).required(),
  serviceId: Joi.string().uuid().required(),
});

export const appointmentUpdateDtoSchema = Joi.object<AppointmentUpdateDto>({
  status: Joi.string()
    .valid('PENDING', 'OCCUPIED', 'COMPLETED', 'CANCELLED')
    .optional(),
  cancellationReason: Joi.string()
    .when('status', { is: 'CANCELLED', then: Joi.required() }),
});
