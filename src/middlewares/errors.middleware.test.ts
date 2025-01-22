import { type Request, type Response } from 'express';
import { ErrorsMiddleware, HttpError } from "./errors.middleware";
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import Joi from 'joi';

const req = {} as unknown as Request;
const res = {
  json: jest.fn(),
  status: jest.fn(),
} as unknown as Response;
const next = jest.fn();

describe('Given an instance of the class ErrorsMiddleware', () => {
  const middleware = new ErrorsMiddleware();

  test('Then it should be an instance of the class', () => {
    expect(middleware).toBeInstanceOf(ErrorsMiddleware);
  });

  describe('When the handle method is called with a HttpError', () => {
    test('Then it should set status to 404 and call res.json', () => {
      const error = new HttpError(404, 'Not Found', 'Resource not found');
      middleware.handle(error, req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: '404 Not Found',
        message: 'Resource not found',
      });
    });
  });

  describe('When the handle method is called with a PrismaClienKnownRequestError', () => {
    test('Then it should set status to 403 and call res.json', () => {
      const error = new PrismaClientKnownRequestError('Prisma error', {
        code: 'P2002',
        clientVersion: '3.0.0',
      });
      middleware.handle(error, req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        status: '403 Forbidden',
        message: 'Prisma error',
      });
    });
  });

  describe('When the handle method is called with a generic Error', () => {
    test('Then it should set status to 500 and call res.json', () => {
      const error = new Error('Generic server error');
      middleware.handle(error, req, res, next);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: '500 Internal Server Error',
        message: 'Generic server error',
      });
    });
  });

  describe('When the handle method is called with a Joi.ValidationError', () => {
    test('Then it should set status to 400 and call.json', () => {
      const schema = Joi.object({
        email: Joi.string().email().required(),
      });
      const { error } = schema.validate({ email: 'invalid-email' });
      middleware.handle(error as Joi.ValidationError, req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: '400 Bad Request',
        message: '"email" must be a valid email',
      });
    });
  });
});
