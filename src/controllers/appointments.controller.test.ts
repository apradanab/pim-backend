import { AppointmentsController } from './appointments.controller';
import { type WithAppointmentFeatures } from '../repositories/type.repo';
import { type Appointment, type AppointmentCreateDto, type AppointmentUpdateDto } from '../entities/appointment';
import { HttpError } from '../middlewares/errors.middleware';
import { type Request, type Response, type NextFunction } from 'express';

describe('Given an instance of the AppointmentController class', () => {
  const repo: WithAppointmentFeatures<Appointment, AppointmentCreateDto> = {
    readAll: jest.fn(),
    readById: jest.fn(),
    readByUser: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    assignAppointmentToUser: jest.fn(),
    approveAppointment: jest.fn(),
    approveCancellation: jest.fn(),
    completePastAppointments: jest.fn(),
  } as unknown as WithAppointmentFeatures<Appointment, AppointmentCreateDto>;

  const req = {} as unknown as Request;
  const res: Response = {
    json: jest.fn(),
    status: jest.fn().mockReturnThis(),
  } as unknown as Response;
  const next: NextFunction = jest.fn();

  const controller = new AppointmentsController(repo);

  test('Should be an instance of AppointmentController', () => {
    expect(controller).toBeInstanceOf(AppointmentsController);
  });

  describe('When calling getByUser method', () => {
    beforeEach(() => {
      req.params = { userId: 'user123' };
    });

    test('Should return appointments for a user', async () => {
      const mockAppointments: Appointment[] = [
        {
          id: '1',
          date: new Date('2025-02-12'),
          startTime: new Date('2025-02-12T10:00:00.000Z'),
          endTime: new Date('2025-02-12T11:00:00.000Z'),
          therapyId: 'therapy1',
          status: 'OCCUPIED',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      (repo.readByUser as jest.Mock).mockResolvedValue(mockAppointments);

      await controller.getByUser(req, res, next);

      expect(repo.readByUser).toHaveBeenCalledWith('user123');
      expect(res.json).toHaveBeenCalledWith(mockAppointments);
    });

    test('Should handle errors when fetching user appointments', async () => {
      (repo.readByUser as jest.Mock).mockRejectedValue(new Error('Database error'));

      await controller.getByUser(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('When calling create method', () => {
    const mockAppointment = {
      date: new Date('2025-02-12'),
      startTime: new Date('2025-02-12T10:00:00.000Z'),
      endTime: new Date('2025-02-12T11:00:00.000Z'),
    };

    const mockConflictAppointment = {
      id: '99',
      date: new Date('2025-02-12'),
      startTime: new Date('2025-02-12T10:30:00.000Z'),
      endTime: new Date('2025-02-12T11:30:00.000Z'),
      therapyId: '1',
      status: 'OCCUPIED',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockRequest = (therapyId: string): AppointmentCreateDto => ({
      ...mockAppointment,
      therapyId: therapyId,
    });

    const mockRepoWithConflict = (therapyId: string): Appointment[] => [
      { ...mockConflictAppointment, therapyId: therapyId, status: 'OCCUPIED' },
    ];
    
    test('Should return error if appointment conflicts with another', async () => {
      const next = jest.fn();
      req.body = mockRequest('1');
      (repo.readAll as jest.Mock).mockResolvedValue(mockRepoWithConflict('1'));

      await controller.create(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(expect.any(HttpError));
    });

    test('Should return error if appointment conflicts due to overlapping times', async () => {
      const next: jest.Mock = jest.fn();
      req.body = mockRequest('1');
      (repo.readAll as jest.Mock).mockResolvedValue(mockRepoWithConflict('1'));
      
      await controller.create(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(expect.any(HttpError));
    });

    test('Should create and return new appointment if valid', async () => {
      const newAppointment: Appointment = {
        id: '123',
        ...mockAppointment,
        therapyId: '1',
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      req.body = newAppointment;
      (repo.readAll as jest.Mock).mockResolvedValue([]);
      (repo.create as jest.Mock).mockResolvedValue(newAppointment);

      await controller.create(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(newAppointment);
    });

    test('Should handle errors when creating an appointment', async () => {
      req.body = { date: new Date(), startTime: new Date(), endTime: new Date(), therapyId: '1' };
      (repo.create as jest.Mock).mockRejectedValue(new Error('Database error'));

      await controller.create(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('When calling update method', () => {
    const updatedAppointment: Appointment = {
      id: '1',
      date: new Date('2025-02-12'),
      startTime: new Date('2025-02-12T10:00:00.000Z'),
      endTime: new Date('2025-02-12T11:00:00.000Z'),
      therapyId: '1',
      status: 'OCCUPIED',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    test('Should return error if appointment not found', async () => {
      req.params = { id: '1' };
      req.body = { status: 'CANCELLED' } as Partial<AppointmentUpdateDto>;
      (repo.readById as jest.Mock).mockResolvedValue(null);

      await controller.update(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(HttpError));
    });

    test('Should update and return appointment if valid', async () => {
      req.params = { id: '1' };
      req.body = { status: 'OCCUPIED', payload: { role: 'ADMIN' } } as Partial<AppointmentUpdateDto>;
      (repo.readById as jest.Mock).mockResolvedValue(updatedAppointment);
      (repo.update as jest.Mock).mockResolvedValue(updatedAppointment);

      await controller.update(req, res, next);

      expect(res.json).toHaveBeenCalledWith(updatedAppointment);
    });

    test('Should return error if cancellation reason is missing', async () => {
      req.params = { id: '1' };
      req.body = { status: 'CANCELLED' };
      (repo.readById as jest.Mock).mockResolvedValue({ id: '1' });

      await controller.update(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(HttpError));
    });

    test('Should update appointment with default user role if payload is missing', async () => {
      req.params = { id: '1' };
      req.body = { status: 'OCCUPIED' } as Partial<AppointmentUpdateDto>;
      (repo.readById as jest.Mock).mockResolvedValue(updatedAppointment);
      (repo.update as jest.Mock).mockResolvedValue(updatedAppointment);

      await controller.update(req, res, next);

      expect(res.json).toHaveBeenCalledWith(updatedAppointment);
    });
  });

  describe('When calling assignAppointment method', () => {
    test('Should assign appointment to user', async () => {
      req.body = { appointmentId: '1', userId: '100' };
      (repo.assignAppointmentToUser as jest.Mock).mockResolvedValue({ appointmentId: '1', userId: '100' });

      await controller.assignAppointment(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ appointmentId: '1', userId: '100' });
    });

    test('Should handle errors when assigning appointment', async () => {
      req.body = { appointmentId: '1', userId: '100' };
      (repo.assignAppointmentToUser as jest.Mock).mockRejectedValue(new Error('Database error'));

      await controller.assignAppointment(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('When calling approveAppointment method', () => {
    test('Should approve appointment', async () => {
      req.params = { id: '1' };
      (repo.approveAppointment as jest.Mock).mockResolvedValue({ id: '1', status: 'CONFIRMED' });

      await controller.approveAppointment(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ id: '1', status: 'CONFIRMED' });
    });

    test('Should handle errors when approving appointment', async () => {
      req.params = { id: '1' };
      (repo.approveAppointment as jest.Mock).mockRejectedValue(new Error('Database error'));

      await controller.approveAppointment(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('When calling requestCancellation method', () => {
    test('Should return error if notes are missing', async () => {
      req.params = { id: '1' };
      req.body = {};

      await controller.requestCancellation(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(HttpError));
    });

    test('Should request cancellation successfully', async () => {
      req.params = { id: '1' };
      req.body = { notes: 'Paciente enfermo' };
      (repo.update as jest.Mock).mockResolvedValue({ id: '1', status: 'PENDING', notes: 'Paciente enfermo' });

      await controller.requestCancellation(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ id: '1', status: 'PENDING', notes: 'Paciente enfermo' });
    });

    test('Should handle errors when requesting cancellation', async () => {
      req.params = { id: '1' };
      req.body = { notes: 'Paciente enfermo' };
      (repo.update as jest.Mock).mockRejectedValue(new Error('Database error'));

      await controller.requestCancellation(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('When calling approveCancellation method', () => {
    test('Should return error for invalid status', async () => {
      req.params = { id: '1' };
      req.body = { newStatus: 'INVALID' };

      await controller.approveCancellation(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(HttpError));
    });

    test('Should approve cancellation successfully', async () => {
      req.params = { id: '1' };
      req.body = { newStatus: 'CANCELLED' };
      (repo.approveCancellation as jest.Mock).mockResolvedValue({ id: '1', status: 'CANCELLED' });

      await controller.approveCancellation(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ id: '1', status: 'CANCELLED' });
    });

    test('Should handle errors when approving cancellation', async () => {
      req.params = { id: '1' };
      req.body = { newStatus: 'CANCELLED' };
      (repo.approveCancellation as jest.Mock).mockRejectedValue(new Error('Database error'));

      await controller.approveCancellation(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('When calling completePastAppointments method', () => {
    test('Should complete past appointments successfully', async () => {
      (repo.completePastAppointments as jest.Mock).mockResolvedValue(undefined);

      await controller.completePastAppointments(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Past appointments updated successfully.' });
    });

    test('Should handle errors when completing past appointments', async () => {
      (repo.completePastAppointments as jest.Mock).mockRejectedValue(new Error('Database error'));

      await controller.completePastAppointments(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
