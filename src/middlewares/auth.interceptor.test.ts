import { type Request, type Response } from 'express';
import { AuthInterceptor } from "./auth.interceptor"
import { Auth } from "../services/auth.services";
import { HttpError } from './errors.middleware';
import { type Repo } from '../repositories/type.repo';

describe('Given a instance of the class AuthInterceptor', () => {
  const interceptor = new AuthInterceptor();
  Auth.verifyJwt = jest.fn().mockReturnValue({ id: '123', role: 'USER' });

  test('Then it should be an instance of the class', () => {
    expect(interceptor).toBeInstanceOf(AuthInterceptor);
  });

  describe('When the authentication method is called', () => {
    const req = {
      body: {},
      get: jest.fn().mockReturnValue('Bearer validToken'),
    } as unknown as Request;
    const res = {} as unknown as Response;
    const next = jest.fn();

    test('It should call next with valid data', () => {
      interceptor.authentication(req, res,  next);
      expect(Auth.verifyJwt).toHaveBeenCalledWith('validToken');
      expect(req.body.payload).toEqual({ id: '123', role: 'USER' });
      expect(next).toHaveBeenCalled();
    });

    test('It should call next with an error for malformed tokens', () => {
      req.get = jest.fn().mockReturnValue('invalidToken');
      interceptor.authentication(req, res, next);
      expect(next).toHaveBeenCalledWith(
        new HttpError(498, 'Token expired/invalid', 'Token invalid')
      );
    });

    test('It should call next with an error for invalid tokens', () => {
      Auth.verifyJwt = jest.fn().mockImplementation(() => {
        throw new Error('Invalid token');
      });
      req.get = jest.fn().mockReturnValue('Bearer invalidToken');
      interceptor.authentication(req, res, next);
      expect(next).toHaveBeenCalledWith(
        new HttpError(498, 'Token expired/invalid', 'Invalid token')
      );
    });
  });

  describe('When the isAdmin method is called', () => {
    const req = { body: { payload: { role: 'USER' }}} as unknown as Request;
    const res = {} as unknown as Response;
    const next = jest.fn();

    test('It should call next for admins', () => {
      req.body.payload.role = 'ADMIN';
      interceptor.isAdmin(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    test('It should call next with an error for non-admins', () => {
      req.body.payload.role = 'USER';
      interceptor.isAdmin(req, res, next);
      expect(next).toHaveBeenCalledWith(
        new HttpError(403, 'Forbidden', 'Access restricted to administrator')
      );
    });
  });

  describe('When the validateRegistrationToken method is called', () => {
    const req = { body: { token: 'validToken' } } as unknown as Request;
    const res = {} as unknown as Response;
    const next = jest.fn();

    test('It should call next with valid token', () => {
      Auth.verifyJwt = jest.fn().mockReturnValue({ id: '123', role: 'USER' });
      interceptor.validateRegistrationToken(req, res, next);
      expect(Auth.verifyJwt).toHaveBeenCalledWith('validToken');
      expect(req.body.payload).toEqual({ id: '123', role: 'USER' });
      expect(next).toHaveBeenCalled();
    });

    test('It should call next with an error for missing token', () => {
      req.body.token = undefined;
      interceptor.validateRegistrationToken(req, res, next);
      expect(next).toHaveBeenCalledWith(
        new HttpError(400, 'Bad Request', 'Token is required')
      );
    });

    test('It should call next with an error for invalid token', () => {
      Auth.verifyJwt = jest.fn().mockImplementation(() => {
        throw new Error('Invalid token');
      });
      req.body.token = 'invalidToken';
      interceptor.validateRegistrationToken(req, res, next);
      expect(next).toHaveBeenCalledWith(
        new HttpError(401, 'Unathorized', 'Invalid or expired token')
      );
    });
  });

  describe('When the authorization method is called', () => {
    const req = {
      body: { payload: { id: '123', role: 'USER' } },
      params: { id: '123' },
    } as unknown as Request;
    const res = {} as unknown as Response;
    const next = jest.fn();

    type T = { id: string };

    const repo: Repo<T, T> = {
      readById : jest.fn().mockResolvedValue({ id: '123' }),
    }as unknown as Repo<T, T>;

    test('It should call next for authorized users', async () => {
      await interceptor.authorization(repo)(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    test('It should call next with an error for unauthorized users', async () => {
      req.body = { payload: { id: '456', role: 'USER' } };
      await interceptor.authorization(repo)(req, res, next);
      expect(next).toHaveBeenCalledWith(
        new HttpError(403, 'Forbidden', 'Access denied')
      );
    });

    test('It should call next for admins', async () => {
      req.body = { payload: { id: '123', role: 'ADMIN' } };
      await interceptor.authorization(repo)(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    test('It should call next with an error for missing resources', async () => {
      req.body = { payload: { id: '123', role: 'USER' } };
      repo.readById = jest.fn().mockResolvedValue(undefined);
      await interceptor.authorization(repo)(req, res, next);
      expect(next).toHaveBeenCalledWith(
        new HttpError(404, 'Not Found', 'Resource not found')
      );
    });

    describe('And method has a second parameter (ownerKey)', () => {
      const createMockResponse = (): Partial<Response> => ({
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
        json: jest.fn(),
      })

      test('It should call next with when ownerKey matches the payload', async () => {
        const repoWithOwnerKey = {
          readById: jest.fn().mockResolvedValue({ email: 'otheruser@example.com' }),
        } as unknown as Repo<{ id: string; email: string }, unknown>;

        const reqWithOwnerKey = {
          body: { payload: { id: '123', role: 'USER' } },
          params: { id: '1' },
        } as unknown as Request;

        const resWithOwnerKey = createMockResponse() as Response;
        const nextWithOwnerKey = jest.fn();
        await interceptor.authorization(repoWithOwnerKey, 'email')(reqWithOwnerKey, resWithOwnerKey, nextWithOwnerKey);

        expect(repoWithOwnerKey.readById).toHaveBeenCalledWith('1');
        expect(nextWithOwnerKey).toHaveBeenCalled();
      });

      test('It should call next with error when ownerKey does not match the payload', async () => {
        const repoWithOwnerKey = {
          readById: jest.fn().mockResolvedValue({ email: 'otheruser@example.com' }),
        } as unknown as Repo<{ id: string; email: string }, unknown>;

        const reqWithOwnerKey = {
          body: { payload: { id: '123', role: 'USER' } },
          params: { id: '1' },
        } as unknown as Request;

        const resWithOwnerKey = createMockResponse() as Response;
        const nextWithOwnerKey = jest.fn();
        await interceptor.authorization(repoWithOwnerKey, 'email')(reqWithOwnerKey, resWithOwnerKey, nextWithOwnerKey);
        
        expect(repoWithOwnerKey.readById).toHaveBeenCalledWith('1');
        expect(nextWithOwnerKey).toHaveBeenCalledWith(
          new HttpError(403, 'Fotbidden', 'Access denied')
        );
      });
    });
  });
});
