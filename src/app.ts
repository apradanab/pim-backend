import createDebug from 'debug';
import express, { type Express } from 'express';
import morgan from 'morgan';
import cors from 'cors';

const debug = createDebug('PIM:app');
export const createApp = () => {
  debug('Creating app');
  return express();
}

export const startApp = (app: Express) => {
  debug('Starting app');
  app.use(morgan('dev'));
  app.use(cors());
  app.use(express.json());
  app.use(express.static('public'));
};
