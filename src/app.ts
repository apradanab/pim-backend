import { type PrismaClient } from '@prisma/client';
import createDebug from 'debug';
import express, { type Express } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { UsersSqlRepo } from './repositories/users.sql.repo.js';
import { UsersController } from './controllers/users.controller.js';
import { UsersRouter } from './routers/users.router.js';
import { TherapiesSqlRepo } from './repositories/therapies.sql.repo.js';
import { TherapiesController } from './controllers/therapies.controller.js';
import { TherapiesRouter } from './routers/therapies.router.js';
import { AdvicesSqlRepo } from './repositories/advices.sql.repo.js';
import { AdvicesController } from './controllers/advices.controller.js';
import { AdvicesRouter } from './routers/advices.router.js';
import { AppointmentsSqlRepo } from './repositories/appointments.sql.repo.js';
import { AppointmentsController } from './controllers/appointments.controller.js';
import { AppointmentsRouter } from './routers/appointments.router.js';
import { FilesInterceptor } from './middlewares/files.interceptor.js';
import { FilesRouter } from './routers/files.router.js';
import { FilesController } from './controllers/files.controller.js';
import { AuthInterceptor } from './middlewares/auth.interceptor.js';
import { ErrorsMiddleware } from './middlewares/errors.middleware.js';

const debug = createDebug('PIM:app');

export const createApp = () => {
  debug('Creating app');
  return express();
}

export const startApp = (app: Express, prisma: PrismaClient) => {
  debug('Starting app');

  app.use(morgan('dev'));
  app.use(cors());
  app.use(express.json());
  app.use(express.static('public'));
  
  app.get('/', (_req, res) => {
    res.status(200).json({ message: 'API is running' });
  });

  const authInterceptor = new AuthInterceptor();
  const filesInterceptor = new FilesInterceptor();

  const usersRepo = new UsersSqlRepo(prisma);
  const usersController = new UsersController(usersRepo);
  const usersRouter = new UsersRouter(
    usersController,
    authInterceptor,
    filesInterceptor
  );
  app.use('/users', usersRouter.router);

  const therapiesRepo = new TherapiesSqlRepo(prisma);
  const therapiesController = new TherapiesController(therapiesRepo);
  const therapiesRouter = new TherapiesRouter(
    therapiesController,
    authInterceptor,
    filesInterceptor
  );
  app.use('/therapies', therapiesRouter.router);

  const advicesRepo = new AdvicesSqlRepo(prisma);
  const advicesController = new AdvicesController(advicesRepo);
  const advicesRouter = new AdvicesRouter(
    advicesController,
    authInterceptor,
    filesInterceptor
  );
  app.use('/advices', advicesRouter.router);

  const appointmentsRepo = new AppointmentsSqlRepo(prisma);
  const appointmentsController = new AppointmentsController(appointmentsRepo);
  const appointmentsRouter = new AppointmentsRouter(
    appointmentsController,
    authInterceptor,
    appointmentsRepo
  );
  app.use('/appointments', appointmentsRouter.router);

  const filesController = new FilesController();
  const filesRouter = new FilesRouter(filesController, filesInterceptor);
  app.use('/files', filesRouter.router);

  const errorsMiddleware = new ErrorsMiddleware();
  app.use(errorsMiddleware.handle.bind(errorsMiddleware));
};
