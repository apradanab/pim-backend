import { type PrismaClient } from '@prisma/client';
import createDebug from 'debug';
import { type WithAppointmentFeatures } from './type.repo.js';
import { type Appointment, type AppointmentCreateDto, type AppointmentUpdateDto } from '../entities/appointment.js';
import { HttpError } from '../middlewares/errors.middleware.js';

const debug = createDebug('PIM:appointments:repo:sql');

const select = {
  id: true,
  date: true,
  startTime: true,
  endTime: true,
  status: true,
  notes: true,
  adminNotes: true,
  therapyId: true,
  createdAt: true,
  updatedAt: true,
  therapy: { select: { id: true, title: true } },
  users: {
    select: {
      id: true,
      createdAt: true,
      appointmentId: true,
      userId: true,
      approved: true,
      user: { select: { id: true, name: true, email: true } },
    },
  },
};

export class AppointmentsSqlRepo implements WithAppointmentFeatures<Appointment, AppointmentCreateDto> {
  constructor(private readonly prisma: PrismaClient) {
    debug('Instantiated AppointmentsSqlRepo');
  }

  async readAll(): Promise<Appointment[]> {
    return this.prisma.appointment.findMany({ select });
  }

  async readById(id: string): Promise<Appointment> {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      select,
    });

    if(!appointment) {
      throw new HttpError(404, 'Not Found', `Appointment ${id} not found`);
    }

    return appointment;
  }

  async readByUser(userId: string): Promise<Appointment[]> {
    return this.prisma.appointment.findMany({
      where: { users: { some: { userId } } },
      select,
    });
  }

  async create(data: AppointmentCreateDto): Promise<Appointment> {
    const conflict = await this.prisma.appointment.findFirst({
      where: { 
        therapyId: data.therapyId, 
        date: data.date, OR: [{ startTime: { lte: data.endTime }, endTime: { gte: data.startTime } }] },
    });

    if(conflict) {
      throw new HttpError(400, 'Bad Request', 'Appointment time conflicts with another booking.');
    }  
    
    return this.prisma.appointment.create({ 
      data, 
      select 
    });
  }

  async update(id: string, data: AppointmentUpdateDto, userRole: string = 'USER'): Promise<Appointment> {
    const appointment = await this.prisma.appointment.findUnique({ where: { id }, select });

    if (!appointment) {
      throw new HttpError(404, 'Not Found', `Appointment ${id} not found`);
    }

    if (userRole !== 'ADMIN') {
      data = { notes: data.notes };
    }

    return this.prisma.appointment.update({
      where: { id },
      data,
      select,
    });
  }

  async approveAppointment(id: string): Promise<Appointment> {
    return this.prisma.appointment.update({
      where: { id },
      data: { status: 'OCCUPIED' },
      select,
    });
  }

  async assignAppointmentToUser(appointmentId: string, userId: string): Promise<Appointment> {
    await this.prisma.appointmentUser.create({
      data: { 
        appointmentId,
        userId,
        approved: true,
      }
    });
    return this.prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: 'OCCUPIED' }, 
      select,
    });
  }

  async approveCancellation(id: string, newStatus: 'AVAILABLE' | 'CANCELLED'): Promise<Appointment> {
    const appointment = await this.prisma.appointment.findUnique({ where: { id }, select });

    if (!appointment) {
      throw new HttpError(404, 'Not Found', `Appointment ${id} not found`)
    }

    if (appointment.status !== 'PENDING') {
      throw new HttpError(400, 'Bad Request', 'Only pending appointments can be approved for cancellation');
    }


    return this.prisma.appointment.update({
      where: { id },
      data: { 
        status: newStatus,
        users: { deleteMany: { appointmentId: id } },
      },
      select,
    });
  }

  async completePastAppointments(): Promise<void> {
    await this.prisma.appointment.updateMany({
      where: {
        status: 'OCCUPIED',
        endTime: { lt: new Date() }
      },
      data: { status: 'COMPLETED' },
    });
  }

  async delete(id: string): Promise<Appointment> {
    return this.prisma.appointment.delete({
      where: { id },
      select,
    });
  }
}
