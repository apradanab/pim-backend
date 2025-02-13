import createDebug from 'debug';
import { type NextFunction, type Request, type Response } from 'express';
import { BaseController } from './base.controller.js';
import { type WithAppointmentFeatures } from '../repositories/type.repo.js';
import { type Appointment, type AppointmentCreateDto, type AppointmentUpdateDto } from '../entities/appointment.js';
import { appointmentCreateDtoSchema, appointmentUpdateDtoSchema } from '../entities/appointment.schema.js';
import { HttpError } from '../middlewares/errors.middleware.js';

const debug = createDebug('PIM:appointments:controller');

export class AppointmentController extends BaseController<Appointment, AppointmentCreateDto> {
  constructor(protected readonly repo: WithAppointmentFeatures<Appointment, AppointmentCreateDto>) {
    super(repo, appointmentCreateDtoSchema, appointmentUpdateDtoSchema);
    debug('Instantiated AppointmentsController');
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { payload, ...data } = req.body as AppointmentCreateDto & { payload?: unknown };

      const appointments = await this.repo.readAll();
      const conflitingAppointment = appointments.find(appt =>
        appt.date.getTime() === data.date.getTime() &&
        appt.startTime.getTime() < data.endTime.getTime() &&
        appt.endTime.getTime() > data.startTime.getTime()
      );

      if (conflitingAppointment) {
        throw new HttpError(400, 'Bad Request', 'Appointment time conflicts with another booking.');
      }

      res.status(201).json(await this.repo.create(data));
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const { payload, ...data } = req.body as Partial<AppointmentUpdateDto> & { payload?: unknown };

    try {
      const appointment = await this.repo.readById(id);
      if (!appointment) throw new HttpError(404, 'Not Found', `Appointment ${id} not found`);

      if (data.status === 'CANCELLED' && !data.notes) {
        throw new HttpError(400, 'Bad Request', 'Cancellation reason is required to cancel an appointment');
      }

      res.json(await this.repo.update(id, data));
    } catch (error) {
      next(error);
    }
  }

  async assignAppointment(req: Request, res: Response, next: NextFunction) {
    const { appointmentId, userId } = req.body;

    try {
      res.status(200).json(await this.repo.assignAppointmentToUser(appointmentId, userId));
    } catch(error) {
      next(error);
    }
  }

  async approveAppointment(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;

    try {
      res.status(200).json(await this.repo.approveAppointment(id));
    } catch (error) {
      next(error);
    }
  }

  async requestCancellation(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const { notes } = req.body;

    if(!notes) {
      next(new HttpError(400, 'Bad Request', 'Cancellation reason is required'));
      return;
    }

    try {
      const result = await this.repo.update(id, { status: 'PENDING', notes });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async approveCancellation(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const { newStatus } = req.body;

    if(!['CANCELLED', 'AVAILABLE'].includes(newStatus)) {
      next(new HttpError(400, 'Bad Request', 'Invalid status provided'));
      return;
    }

    try {
      res.status(200).json(await this.repo.approveCancellation(id, newStatus as 'CANCELLED' | 'AVAILABLE'));
    } catch(error) {
      next(error);
    }
  }

  async completePastAppointments(req: Request, res: Response, next: NextFunction) {
    try {
      await this.repo.completePastAppointments();
      res.status(200).json({ message: 'Past appointments updated successfully.' });
    } catch(error) {
      next(error);
    }
  }
}
