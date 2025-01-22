import { UsersController } from './users.controller';
import { type UsersSqlRepo } from '../repositories/users.sql.repo';
import { Auth } from '../services/auth.services';
import { EmailService } from '../services/email.services';
import { HttpError } from '../middlewares/errors.middleware';
import { type Request, type Response } from 'express';
import 'dotenv/config';

describe('Given an instance of the UserController class', () => {
  const repo: UsersSqlRepo = {
    readAll: jest.fn(),
    readById: jest.fn(),
    searchForLogin: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  } as unknown as UsersSqlRepo;

  jest.spyOn(Auth, 'signJwt').mockReturnValue('token');
  jest.spyOn(Auth, 'verifyJwt').mockReturnValue({ id: '1', role: 'USER' });
  jest.spyOn(EmailService, 'generateRegistrationEmail').mockReturnValue({ 
    subject: 'Welcome', 
    content: 'Welcome email content' 
  });
  jest.spyOn(EmailService, 'sendEmail').mockResolvedValue();

  const req = {} as unknown as Request;
  const res: Response = {
    json: jest.fn(),
    status: jest.fn().mockReturnThis(),
  } as unknown as Response;
  const next = jest.fn();

  const controller = new UsersController(repo);

  const TEST_PASSWORD = process.env.TEST_PASSWORD ?? 'defaultTestPassword';
  const TEST_HASHED_PASSWORD = process.env.TEST_HASHED_PASSWORD ?? 'defaultHashedPassword';

  jest.spyOn(Auth, 'hash').mockResolvedValue(TEST_HASHED_PASSWORD);

  test('Should be an instance of the UsersController class', () => {
    expect(controller).toBeInstanceOf(UsersController);
  });

  describe('When calling the login method', () => {
    test('Should call next with an error if email or password is missing', async () => {
      req.body = {};      
      await controller.login(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(HttpError));
    });

    test('Should call next with an error if user is not found', async () => {
      req.body = { email: 'test@example.com', password: TEST_PASSWORD };
      (repo.searchForLogin as jest.Mock).mockResolvedValue(null);

      await controller.login(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(HttpError));
    });

    test('Should call next with an error if password is invalid', async () => {
      req.body = { email: 'test@example.com', password: TEST_PASSWORD };
      (repo.searchForLogin as jest.Mock).mockResolvedValue({ 
        id: '1', 
        password: TEST_HASHED_PASSWORD 
      });
      Auth.compare = jest.fn().mockResolvedValue(false);

      await controller.login(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(HttpError));
    });

    test('Should call next with an error if an unexpected error occurs', async () => {
      req.body = { email: 'test@example.com', password: TEST_PASSWORD };
      (repo.searchForLogin as jest.Mock).mockRejectedValue(new Error('Unexpected Error'));

      await controller.login(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    })

    test('Should return a token if login is successful', async () => {
      req.body = { email: 'test@example.com', password: TEST_PASSWORD };
      (repo.searchForLogin as jest.Mock).mockResolvedValue({ 
        id: '1', 
        role: 'USER', 
        password: TEST_HASHED_PASSWORD 
      });
      jest.spyOn(Auth, 'compare').mockResolvedValue(true);

      await controller.login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ token: 'token', message: 'Login successful' });
    });
  });

  describe('When calling the create method', () => {
    test('Should call next with an error if request body is invalid', async () => {
      req.body = { name: 'test' };
      await controller.create(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(HttpError));
    });

    test('Should call next with an error if creation fails', async () => {
      req.body = { name: 'test', email: 'test@example.com', message: 'Hello' };
      (repo.create as jest.Mock).mockRejectedValue(new Error('Creation failed'));

      await controller.create(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    test('Should create and return a new user if data is valid', async () => {
      req.body = { name: 'test', email: 'test@example.com', message: 'Hello' };
      const newUser = { 
        id: '1', 
        name: 'test', 
        email: 'test@example.com', 
        message: 'Hello' 
      };
      (repo.create as jest.Mock).mockResolvedValue(newUser);
      
      await controller.create(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(newUser);
    });
  });

  describe('When calling the approveUser method', () => {
    test('Should call next with a Not Found error if user is not found', async () => {
      req.params = { id: '1' };
      (repo.readById as jest.Mock).mockResolvedValue(null);

      await controller.approveUser(req, res, next);

      expect(next).toHaveBeenCalledWith(new HttpError(404, 'Not Found', 'User not found'));
    });

    test('Should call next with an error if an unexpected error occurs', async () => {
      req.params = { id: '1' };
      (repo.readById as jest.Mock).mockResolvedValue({ id: '1', name: 'Test User', email: 'test@example.com' });
      (repo.update as jest.Mock).mockRejectedValue(new Error('Unexpected Error'));

      await controller.approveUser(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    test('And the user is found, it should approve the user and send an email', async () => {
      const user = { id: '1', name: 'Test User', email: 'test@example.com'};
      req.params = { id: '1' };
      (repo.readById as jest.Mock).mockResolvedValue(user);
      (repo.update as jest.Mock).mockResolvedValue({ ...user, approved: true, role: 'USER' });
      
      await controller.approveUser(req, res, next);

      expect(repo.readById).toHaveBeenCalledWith('1');
      expect(repo.update).toHaveBeenCalledWith('1', { approved: true, role: 'USER' });
      expect(EmailService.sendEmail).toHaveBeenCalledWith(
        'test@example.com',
        'Welcome',
        'Welcome email content'
      );
      expect(res.json).toHaveBeenCalledWith({ ...user, approved: true, role: 'USER' });
    });
  });

  describe('When calling the validateRegistration method', () => {
    test('Should call next with a Bad Request error if token is missing', async () => {
      req.body = {};

      await controller.validateRegistration(req, res, next);

      expect(next).toHaveBeenCalledWith(new HttpError(400, 'Bad Request', 'Token is required'));
    });

    test('Should call next with a Not Found error if user is not found', async () => {
      req.body = { token: 'valid-token' };
      (repo.readById as jest.Mock).mockResolvedValue(null);

      await controller.validateRegistration(req, res, next);

      expect(next).toHaveBeenCalledWith(new HttpError(404, 'Not Found', 'User not found'));
    });

    test('Should return a success message if token is valid', async () => {
      req.body = { token: 'valid-token' };
      const user = { id: '1', name: 'Test User' };
      (repo.readById as jest.Mock).mockResolvedValue(user);

      await controller.validateRegistration(req, res, next);

      expect(Auth.verifyJwt).toHaveBeenCalledWith('valid-token');
      expect(repo.readById).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Token valid', user });
    });
  });

  describe('When calling the update method', () => {
    test('Should call next with an error if validation fails', async () => {
      req.params = { id: '1' };
      req.body = { ivalidField: 'invalid' };

      await controller.update(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(HttpError));
    });

    test('Should hash the password and update the user', async () => {
      req.params = { id: '1' };
      req.body = { password: TEST_PASSWORD };
      (repo.update as jest.Mock).mockResolvedValue({ id: '1', password: TEST_HASHED_PASSWORD });

      await controller.update(req, res, next);

      expect(Auth.hash).toHaveBeenCalledWith(TEST_PASSWORD);
      expect(repo.update).toHaveBeenCalledWith('1', { password: TEST_HASHED_PASSWORD });
      expect(res.json).toHaveBeenCalledWith({ id: '1', password: TEST_HASHED_PASSWORD });
    });

    test('Should call next with an error if update fails', async () => {
      req.params = { id: '1' };
      req.body = { name: 'Updated Name' };
      (repo.update as jest.Mock).mockRejectedValue(new Error('Updated failed'));

      await controller.update(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
