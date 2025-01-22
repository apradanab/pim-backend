import { type NextFunction, type Request, type Response } from 'express';
import createDebug from 'debug';
import { HttpError } from './errors.middleware.js';
import { Auth, type Payload } from '../services/auth.services.js';


const debug = createDebug('PIM:auth:interceptor');
type Repo<T> = {
  readById(id: string): Promise<T | undefined>;
}

export class AuthInterceptor {
  constructor() {
    debug('Instantiated AuthInterceptor');
  }

  authentication(req: Request, _res: Response, next: NextFunction) {
    debug('Authenticating request');
    const authorizationHeader = req.get('Authorization');
    const error = new HttpError(498, 'Token expired/invalid', 'Token invalid');
    
    if(!authorizationHeader?.startsWith('Bearer')) {
      next(error);
      return;
    }

    const token = authorizationHeader.slice(7);
    
    try {
      const payload = Auth.verifyJwt(token);
      req.body.payload = payload;
      debug('Authentication successful');
      next();
    } catch(err) {
      debug('Authentication failed');
      error.message = (err as Error).message;
      next(error);
    }
  }

  isAdmin(req: Request, _res: Response, next: NextFunction) {
    debug('Checking admin role');
    const { payload } = req.body as { payload: Payload };
    const { role } = payload;

    if(role !== 'ADMIN') {
      next(new HttpError(403, 'Forbidden', 'Access restricted to administrator'));
      return;
    }

    debug('Admin role verified');
    next();
  }

  validateRegistrationToken(req: Request, _res: Response, next: NextFunction) {
    const { token } = req.body;
    if(!token) {
      next(new HttpError(400, 'Bad Request', 'Token is required'));
      return;
    }

    try {
      const payload = Auth.verifyJwt(token);
      req.body.payload = payload;
      next();
    } catch (err) {
      next(new HttpError(401, 'Unauthorized', 'Invalid or expired token'));
    }
  }

  authorization<T extends { id: string }>(
    repo: Repo<T>,
    ownerKey?: keyof T
  ) {
    return async(req: Request, res: Response, next: NextFunction) => {
      debug('Authorizing request');
      const { payload, ...rest} = req.body as { payload: Payload };
      req.body = rest;
      const { role } = payload;

      if(role === 'ADMIN') {
        next();
        return;
      }

      try {
        const item = await repo.readById(req.params.id);

        if(item === undefined) {
          throw new HttpError(404, 'Not Found', 'Resource not found');
        }

        const typedItem: T = item;
        const ownerId = ownerKey ? typedItem[ownerKey] : typedItem.id;

        if (payload.id !== ownerId) {
          next(new HttpError(403, 'Forbidden', 'Access denied'));
          return;
        }

        debug('Authorization successful', req.body);
        next();
      } catch(error) {
        next(error);
      }
    }
  }
}
