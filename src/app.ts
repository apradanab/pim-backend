import { type PrismaClient } from '@prisma/client';
import createDebug from 'debug';
import express, { type Express } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { UsersSqlRepo } from './repositories/users.sql.repo.js';
import { UsersController } from './controllers/users.controller.js';
import { UsersRouter } from './routers/users.router.js';

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

  const usersRepo = new UsersSqlRepo(prisma);
  const usersController = new UsersController(usersRepo);
  const usersRouter = new UsersRouter(usersController);

  app.use("/users", usersRouter.router);

  app.get('/', (req, res) => {
    res.status(200).send('Welcome to the PIM backend!');
  });

  return app;
};
