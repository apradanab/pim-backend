import Joi from "joi";

export const appointmentCreateDtoSchema = Joi.object({
  date: Joi.date().required(),
  startTime: Joi.date().required(),
  endTime: Joi.date().greater(Joi.ref('startTime')).required(),
  serviceId: Joi.string().uuid().required(),
});

export const appointmentUpdateDtoSchema = Joi.object({
  status: Joi.string().valid('PENDING', 'OCCUPIED', 'COMPLETED', 'CANCELLED'),
  cancellationReason: Joi.when('status', {
    is: 'CANCELLED',
    then: Joi.string().required().messages({
      'any.required': 'Cancellation reason is required to cancel an appointment',
    }),
  }),
});
