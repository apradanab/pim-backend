import { hash, compare } from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Auth } from './auth.services';

jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('Given the Auth static class', () => {

  beforeEach(() => {
    process.env.SECRET_JWT = 'test secret';
  });

  afterEach(() => {
    jest.clearAllMocks();
  })

  describe('When accessing Auth.secret', () => {
    test('Then it should return the enviroment variable value', () => {
      process.env.SECRET_JWT = 'test secret';
      expect(Auth.secret).toBe('test secret');
    });

    test('Then it should return an empty string if SECRET_JWT is undefined', () => {
      delete process.env.SECRET_JWT;
      expect(Auth.secret).toBe('');
    });
  });

  describe('When the static method hash is called', () => {
    test('Then it should invoke hash from bcrypt', async () => {
      await Auth.hash('test');
      expect(hash).toHaveBeenCalled();
    });
  });

  describe('When the static method compare is called', () => {
    test('Then it should invoke compare from bcrypt', async () => {
      await Auth.compare('test', 'test');
      expect(compare).toHaveBeenCalled();
    });
  });

  describe('When the static method signJwt is called', () => {
    test('Then it should invoke sign from jwt', () => {
      Auth.signJwt({ id: 'test', role: 'test' });
      expect(jwt.sign).toHaveBeenCalledWith({ id: 'test', role: 'test' },'test secret');
    });
  });

  describe('And the secret is not set in Auth.secret', () => {
    test('Then it should throw an error', () => {
      process.env.SECRET_JWT = '';
      const result = () => Auth.signJwt({ id: 'test', role: 'test' });
      expect(result).toThrow('JWT secret not set');
    });
  });

  describe('When the static method verifyJwt is called', () => {
    test('Then it should invoke verify from jwt', () => {
      Auth.verifyJwt('test');
      expect(jwt.verify).toHaveBeenCalledWith('test', 'test secret');
    });
  });

  describe('And the secret is not set in Auth.secret', () => {
    test('Then it should throw an error', () => {
      process.env.SECRET_JWT = '';
      const result = () => Auth.verifyJwt('test');
      expect(result).toThrow('JWT secret not set');
    });
  });
});
