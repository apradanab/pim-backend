import { AppointmentsSqlRepo } from './appointments.sql.repo';
import { HttpError } from '../middlewares/errors.middleware';
import { type AppointmentCreateDto, type AppointmentUpdateDto } from '../entities/appointment';
import { type PrismaClient } from '@prisma/client';
import { count } from 'console';

const mockPrisma = {
  appointment: {
    findMany: jest.fn().mockResolvedValue([]),
    findUnique: jest.fn().mockResolvedValue({ id: '1', status: 'PENDING', serviceId: 'service1' }),
    findFirst: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue({ id: '1', status: 'PENDING' }),
    update: jest.fn().mockResolvedValue({ id: '1', status: 'OCCUPIED' }),
    updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    delete: jest.fn().mockResolvedValue({ id: '1' }),
  },
  appointmentUser : {
    create: jest.fn().mockResolvedValue({ id: '1', appointmentId: '1', userId: 'user1'}),
    deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
  },
} as unknown as PrismaClient;

describe('AppointmentSqlRepo', () => {
  const repo = new AppointmentsSqlRepo(mockPrisma);

  describe('readAll', () => {
    test('should call prisma.appointment.findMany and return appointments', async () => {
      const result = await repo.readAll();
      expect(mockPrisma.appointment.findMany).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('readById', () => {
    test('should return an appointment when the ID is valid', async () => {
      const result = await repo.readById('1');
      expect(mockPrisma.appointment.findUnique).toHaveBeenCalledWith({ where: { id: '1' }, select: expect.any(Object) });
      expect(result).toEqual({ id: '1', status: 'PENDING', serviceId: 'service1' });
    });

    test('should throw a 404 error if the appointment is not found', async () => {
      (mockPrisma.appointment.findUnique as jest.Mock).mockResolvedValueOnce(null);
      await expect(repo.readById('2')).rejects.toThrow(
        new HttpError(404, 'Not Found', 'Appointment 2 not found')
      );
    });
  });

  describe('readByUser', () => {
    test('should return all appointments for a user', async () => {
      const result = await repo.readByUser('user1');
      expect(mockPrisma.appointment.findMany).toHaveBeenCalledWith({
        where: { users: { some: { userId: 'user1' } } },
        select: expect.any(Object),
      });
      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    test('should create a new appointment when no conflict exists', async () => {
      const data: AppointmentCreateDto = { date: new Date(), startTime: new Date(), endTime: new Date(), serviceId: 'service1' };
      const result = await repo.create(data);
      expect(mockPrisma.appointment.create).toHaveBeenCalledWith({ data, select: expect.any(Object) });
      expect(result).toEqual({ id: '1', status: 'PENDING' });
    });

    test('should throw error if appointment conflicts with existing one', async () => {
      (mockPrisma.appointment.findFirst as jest.Mock).mockResolvedValueOnce({ id: '2' });
      const data: AppointmentCreateDto = { date: new Date(), startTime: new Date(), endTime: new Date(), serviceId: 'service1' };
      await expect(repo.create(data)).rejects.toThrow('Appointment time conflicts with another booking.');
    })
  })

  describe('update', () => {
    test('should update an appointment successfully', async () => {
      const data: AppointmentUpdateDto = { status: 'CANCELLED', notes: 'User requested cancellation' };
      const result = await repo.update('1', data);
      expect(mockPrisma.appointment.update).toHaveBeenCalledWith({ where: { id: '1' }, data, select: expect.any(Object) });
      expect(result).toEqual({ id: '1', status: 'OCCUPIED' });
    });

    test('should throw 404 error if appointment not found', async () => {
      (mockPrisma.appointment.findUnique as jest.Mock).mockResolvedValueOnce(null);
      await expect(repo.update('2', { status: 'CANCELLED' })).rejects.toThrow(new HttpError(404, 'Not Found', 'Appointment 2 not found'));
    });
  });

  describe('approveAppointment', () => {
    test('should approve an appointment and mark it as OCCUPIED', async () => {
      const result = await repo.approveAppointment('1');
      expect(mockPrisma.appointment.update).toHaveBeenCalledWith({ where: { id: '1' }, data: { status: 'OCCUPIED' }, select: expect.any(Object) });
      expect(result).toEqual({ id: '1', status: 'OCCUPIED' });
    });
  });

  describe('assignAppointmentToUser', () => {
    test('should assign an appointment to a user', async () => {
      const result = await repo.assignAppointmentToUser('1', 'user1');
      expect(mockPrisma.appointmentUser.create).toHaveBeenCalledWith({ data: { appointmentId: '1', userId: 'user1', approved: true } });
      expect(result).toEqual({ id: '1', status: 'OCCUPIED' });
    });
  });

  describe('approveCancellation', () => {
    test('should approve cancellation and mark it as AVAILABLE', async () => {
      const result = await repo.approveCancellation('1', 'AVAILABLE');
      expect(mockPrisma.appointment.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { status: 'AVAILABLE', users: { deleteMany: { appointmentId: '1' } } },
        select: expect.any(Object),
      });
      expect(result).toEqual({ id: '1', status: 'OCCUPIED' });
    });

    test('should throw 404 error if appointment is not found', async () => {
      (mockPrisma.appointment.findUnique as jest.Mock).mockResolvedValueOnce(null);
      await expect(repo.approveCancellation('2', 'AVAILABLE')).rejects.toThrow(new HttpError(404, 'Not Found', 'Appointment 2 not found'));
    });

    test('should throw 400 error if appointment is not in PENDING status', async () => {
      (mockPrisma.appointment.findUnique as jest.Mock).mockResolvedValueOnce({ id: '1', status: 'OCCUPIED' });
      await expect(repo.approveCancellation('1', 'AVAILABLE')).rejects.toThrow(
        new HttpError(400, 'Bad Request', 'Only pending appointments can be approved for cancellation')
      );
    });
  });

  describe('completePastAppointments', () => {
    test('should mark past occupied apointments as completed', async () => {
      await repo.completePastAppointments();
      expect(mockPrisma.appointment.updateMany).toHaveBeenCalledWith({
        where: { status: 'OCCUPIED', endTime: { lt: expect.any(Date) } },
        data: { status: 'COMPLETED' },
      });
    });
  });

  describe('delete', () => {
    test('should delete an appointment', async () => {
      const result = await repo.delete('1');
      expect(mockPrisma.appointment.delete).toHaveBeenCalledWith({ where: { id: '1'}, select: expect.any(Object) });
      expect(result).toEqual({ id: '1' });
    });
  });
});
