import { hash, compare } from 'bcrypt';
import jwt from 'jsonwebtoken';

export type Payload = {
  id: string;
  role: string;
} & jwt.JwtPayload;

export class Auth {
  public static get secret(): string {
    return process.env.SECRET_JWT ?? '';
  }

  static async hash(value: string) {
    return hash(value, 10);
  }

  static async compare(value: string, hash: string) {
    return compare(value, hash);
  }

  static signJwt(payload: Payload) {
    if (!Auth.secret) {
      throw new Error('JWT secret not set');
    }

    return jwt.sign(payload, Auth.secret);
  }

  static verifyJwt(token: string) {
    if (!Auth.secret) throw new Error('JWT secret not set');
    return jwt.verify(token, Auth.secret) as Payload;
  }
}
