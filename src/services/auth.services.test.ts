import { hash, compare } from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Auth } from './auth.services';

jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('Given the Auth static class', () => {
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
      Auth.secret = 'test secret';
      Auth.signJwt({ id: 'test', role: 'test' });
      expect(jwt.sign).toHaveBeenCalled();
    });
  });

  describe('And the secret is not set in Auth.secret', () => {
    test('Then it should throw an error', () => {
      Auth.secret = '';
      const result = () => Auth.signJwt({ id: 'test', role: 'test' });
      expect(result).toThrow('JWT secret not set');
    });
  });

  describe('When the static method verifyJwt is called', () => {
    test('Then it should invoke verify from jwt', () => {
      Auth.secret = 'test secret';
      Auth.verifyJwt('test');
      expect(jwt.verify).toHaveBeenCalled();
    });
  });

  describe('And the secret is not set in Auth.secret', () => {
    test('Then it should throw an error', () => {
      Auth.secret = '';
      const result = () => Auth.verifyJwt('test');
      expect(result).toThrow('JWT secret not set');
    });
  });
});
