process.env.SENDGRID_API_KEY = 'mock-sendgrid-api-key';

import { UsersController } from './users.controller';
import { type UsersSqlRepo } from '../repositories/users.sql.repo';
import { Auth } from '../services/auth.services';
import { EmailService } from '../services/email.services';
import { HttpError } from '../middlewares/errors.middleware';
import { type Request, type Response } from 'express';
import 'dotenv/config';
import { BaseController } from './base.controller';

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

  describe('When calling the replyToGuest method', () => {
    test('Should call next with an error if message is missing', async () =>{
      req.params = { id: '1' };
      req.body = {};

      await controller.replyToGuest(req, res, next);

      expect(next).toHaveBeenCalledWith(new HttpError(400, 'Bad Request', 'Message is required'));
    });

    test('Should call next with an error if user is not found', async () => {
      req.params = { id: '1' };
      req.body = { message: 'Test reply' };
      (repo.readById as jest.Mock).mockResolvedValue(null);

      await controller.replyToGuest(req, res, next);

      expect(next).toHaveBeenCalledWith(new HttpError(404, 'Not Found', 'Guest user not found'));
    });

    test('Should call next with an error if user is not a GUEST', async () => {
      req.params = { id: '1' };
      req.body = { message: 'Test reply' };
      (repo.readById as jest.Mock).mockResolvedValue({ id: '1', email: 'test@mail.com', role: 'USER' });

      await controller.replyToGuest(req, res, next);

      expect(next).toHaveBeenCalledWith(new HttpError(404, 'Not Found', 'Guest user not found'));
    });

    test('Should send an email and return success response if user is a GUEST', async () => {
      req.params = { id: '1' };
      req.body = { message: 'Test reply' };
      (repo.readById as jest.Mock).mockResolvedValue({ id: '1', email: 'test@mail.com', role: 'GUEST' });

      await controller.replyToGuest(req, res, next);

      expect(EmailService.sendEmail).toHaveBeenCalledWith(
        'test@mail.com',
        'Respuesta a tu consulta',
        '<p>Test reply</p>'
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Reply sent succesfully' });
    });

    test('Should call next with an error if email sending fails', async () => {
      req.params = { id: '1' };
      req.body = { message: 'Test reply' };
      (repo.readById as jest.Mock).mockResolvedValue({ id: '1', email: 'test@mail.com', role: 'GUEST' });
      (EmailService.sendEmail as jest.Mock).mockRejectedValue(new Error('Email error'));

      await controller.replyToGuest(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
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

    test('Should generate an email, send it, and return the updated user', async () => {
      req.params = { id: '1' };
      const user = { id: '1', name: 'Test USer', email: 'test@example.com', role: 'GUEST' };
      const updatedUser = { ...user, approved: true, role: 'USER' };
      const emailData = { subject: 'Welcome', content: 'Welcome email content' };

      (repo.readById as jest.Mock).mockResolvedValue(user);
      (repo.update as jest.Mock).mockResolvedValue(updatedUser);
      (EmailService.generateRegistrationEmail as jest.Mock).mockReturnValue(emailData);
      (EmailService.sendEmail as jest.Mock).mockResolvedValue(undefined);

      await controller.approveUser(req, res, next);

      expect(repo.readById).toHaveBeenCalledWith('1');
      expect(repo.update).toHaveBeenCalledWith('1', { approved: true, role: 'USER' });
      expect(EmailService.generateRegistrationEmail).toHaveBeenCalledWith(user.name, user.id, user.role);
      expect(EmailService.sendEmail).toHaveBeenCalledWith(user.email, emailData.subject, emailData.content);
      expect(res.json).toHaveBeenCalledWith(updatedUser);
    });

    test('Should call next with an error if email sending fails', async () => {
      req.params = { id: '1' };
      const user = { id: '1', name: 'Test User', email: 'test@example.com', role: 'GUEST' };
      const updatedUser = { ...user, approved: true, role: 'USER' };
      const emailData = { subject: 'Welcome', content: 'Welcome email content' };

      (repo.readById as jest.Mock).mockResolvedValue(user);
      (repo.update as jest.Mock).mockResolvedValue(updatedUser);
      (EmailService.generateRegistrationEmail as jest.Mock).mockReturnValue(emailData);
      (EmailService.sendEmail as jest.Mock).mockRejectedValue(new Error('Email service error'));

      await controller.approveUser(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
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
    beforeEach(() => {
      jest.clearAllMocks();
      req.params = { id: '1' };
    });

    test('Should hash password before calling super.update', async () => {
      req.body = { password: TEST_PASSWORD };
      await controller.update(req, res, next);
      
      expect(Auth.hash).toHaveBeenCalledWith(TEST_PASSWORD);
      expect(repo.update).toHaveBeenCalled();
    });

    test('Should handle hashing errors', async () => {
      req.body = { password: TEST_PASSWORD };
      const mockError = new Error('Hashing failed');
      (Auth.hash as jest.Mock).mockRejectedValue(mockError);

      await controller.update(req, res, next);

      expect(next).toHaveBeenCalledWith(mockError);
      expect(repo.update).not.toHaveBeenCalled();
    });
  });
});
