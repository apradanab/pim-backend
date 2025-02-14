import createDebug from 'debug';
import { BaseRouter } from './base.router.js';
import { Appointment, AppointmentCreateDto } from '../entities/appointment.js';
import { type AppointmentsController } from '../controllers/appointments.controller.js';
import { type AuthInterceptor } from '../middlewares/auth.interceptor.js';
import { AppointmentsSqlRepo } from '../repositories/appointments.sql.repo.js';

const debug = createDebug('PIM:appointments:router');

export class AppointmentsRouter extends BaseRouter<Appointment, AppointmentCreateDto> {
  constructor(
    readonly controller: AppointmentsController,
    readonly authInterceptor: AuthInterceptor,
    readonly repo: AppointmentsSqlRepo
  ) {
    super(controller, authInterceptor);
    debug('Instantiated AppointmentsRouter');

    this.router.post(
      '/',
      authInterceptor.authentication.bind(authInterceptor),
      controller.create.bind(controller)
    );

    this.router.patch(
      '/:id',
      authInterceptor.authentication.bind(authInterceptor),
      authInterceptor.authorization<Appointment>(repo, 'id'),
      controller.update.bind(controller)
    );

    this.router.patch(
      '/request-cancellation/:id',
      authInterceptor.authentication.bind(authInterceptor),
      authInterceptor.authorization<Appointment>(repo, 'id'),
      controller.requestCancellation.bind(controller)
    );

    this.router.get(
      '/user/:userId',
      authInterceptor.authentication.bind(authInterceptor),
      authInterceptor.authorization<Appointment>(repo, 'users'),
      controller.getByUser.bind(controller)
    );

    this.router.post(
      '/assign',
      authInterceptor.authentication.bind(authInterceptor),
      authInterceptor.isAdmin.bind(authInterceptor),
      controller.assignAppointment.bind(controller)
    );

    this.router.patch(
      '/approve/:id',
      authInterceptor.authentication.bind(authInterceptor),
      authInterceptor.isAdmin.bind(authInterceptor),
      controller.approveAppointment.bind(controller)
    );

    this.router.patch(
      '/approve-cancellation/:id',
      authInterceptor.authentication.bind(authInterceptor),
      authInterceptor.isAdmin.bind(authInterceptor),
      controller.approveCancellation.bind(controller)
    );
  }
}
