import { type Request, type Response, type NextFunction } from 'express';
import { type AppointmentsController } from '../controllers/appointments.controller';
import { type AuthInterceptor } from '../middlewares/auth.interceptor';
import { type AppointmentsSqlRepo } from '../repositories/appointments.sql.repo';
import { AppointmentsRouter } from './appointments.router';

describe('Given an instance of the class AppointmentRouter', () => {
  const controller = {
    getAll: jest.fn(),
    getById: jest.fn(),
    getByUser: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    requestCancellation: jest.fn(),
    assignAppointment: jest.fn(),
    approveAppointment: jest.fn(),
    approveCancellation: jest.fn(),
    delete: jest.fn(),
  } as unknown as AppointmentsController;

  const authInterceptor = {
    authentication: jest.fn(),
    isAdmin: jest.fn(),
    authorization: jest.fn(() => (req: Request, res: Response, next: NextFunction) => next()),
  } as unknown as AuthInterceptor;

  const repo = {} as unknown as AppointmentsSqlRepo;

  const router = new AppointmentsRouter(controller, authInterceptor, repo);

  test('Then it should be an instance of AppointmentRouter', () => {
    expect(router).toBeInstanceOf(AppointmentsRouter);
  });
});
