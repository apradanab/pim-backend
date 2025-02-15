import { type PrismaClient } from '@prisma/client';
import createDebug from 'debug';
import express, { type Express } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { UsersSqlRepo } from './repositories/users.sql.repo.js';
import { UsersController } from './controllers/users.controller.js';
import { UsersRouter } from './routers/users.router.js';
import { ServicesSqlRepo } from './repositories/services.sql.repo.js';
import { ServicesController } from './controllers/services.controller.js';
import { ServicesRouter } from './routers/services.router.js';
import { ResourcesSqlRepo } from './repositories/resources.sql.repo.js';
import { ResourcesController } from './controllers/resources.controller.js';
import { ResourcesRouter } from './routers/resources.router.js';
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

  const servicesRepo = new ServicesSqlRepo(prisma);
  const servicesController = new ServicesController(servicesRepo);
  const servicesRouter = new ServicesRouter(
    servicesController,
    authInterceptor,
    filesInterceptor
  );
  app.use('/services', servicesRouter.router);

  const resourcesRepo = new ResourcesSqlRepo(prisma);
  const resourcesController = new ResourcesController(resourcesRepo);
  const resourcesRouter = new ResourcesRouter(
    resourcesController,
    authInterceptor,
    filesInterceptor
  );
  app.use('/resources', resourcesRouter.router);

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
