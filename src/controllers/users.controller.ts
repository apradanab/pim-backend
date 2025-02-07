import createDebug from 'debug';
import { type NextFunction, type Request, type Response } from 'express';
import { type User, type UserCreateDto, type UserUpdateDto } from '../entities/user.js';
import { HttpError } from '../middlewares/errors.middleware.js';
import { Auth } from '../services/auth.services.js';
import { userCreateDtoSchema, userUpdateDtoSchema } from '../entities/user.schema.js';
import { BaseController } from './base.controller.js';
import { type WithLoginRepo } from '../repositories/type.repo.js';
import { EmailService } from '../services/email.services.js';

const debug = createDebug('PIM:users:controller');

export class UsersController extends BaseController<User, UserCreateDto> {
  constructor(protected readonly repo: WithLoginRepo<User, UserCreateDto>) {
    super(repo, userCreateDtoSchema, userUpdateDtoSchema);
    debug('Instantiated UsersController');
  }

  async login(req: Request, res: Response, next: NextFunction) {
    const { email, password } = req.body as { email: string; password: string };

    if(!email || !password) {
      next(new HttpError(400, 'Bad Request', 'Email and password are required'))
      return;
    }

    try {
      const user = await this.repo.searchForLogin('email', email);

      if(!user || !(await Auth.compare(password, user.password!))) {
        next(new HttpError(401, 'Unauthorized', 'Invalid email or password'));
      }

      const token = Auth.signJwt({
        id: user.id!,
        role: user.role!,
      });

      res.status(200).json({ token, message: 'Login successful' });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    const { name, email, message } = req.body;
    const { error } = userCreateDtoSchema.validate({ name, email, message });

    if(error) {
      next(new HttpError(
        400, 
        'Validation Error', error.details.map(d => d.message).join(', ')));
      return;
    }

    try {
      const userData: UserCreateDto = { name, email, message };
      const newUser = await this.repo.create({ ...userData });
      res.status(201).json(newUser);
    } catch(error) {
      next(error);
    }
  }

  async replyToGuest(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const { message } = req.body;

    if(!message) {
      next(new HttpError(400, 'Bad Request', 'Message is required'));
      return;
    }

    try {
      const user = await this.repo.readById(id);

      if(!user || user.role !== 'GUEST') {
        next(new HttpError(404, 'Not Found', 'Guest user not found'));
        return;
      }

      await EmailService.sendEmail(
        user.email,
        'Respuesta a tu consulta',
        `<p>${message}</p>`
      );

      res.status(200).json({ message: 'Reply sent succesfully' });
    } catch(error) {
      next(error);
    }
  }

  async approveUser(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;

    try {
      const user = await this.repo.readById(id);

      if(!user) {
        next(new HttpError(404, 'Not Found', 'User not found'));
        return;
      }
      
      const updatedUser = await this.repo.update(id, {
        approved: true,
        role: 'USER',
      } as UserUpdateDto);

      const { subject, content } = EmailService.generateRegistrationEmail(user.name, user.id, user.role);
      await EmailService.sendEmail(user.email, subject, content);

      res.json(updatedUser);
    } catch(error) {
      next(error);
    }
  }

  async validateRegistration(req: Request, res: Response, next: NextFunction) {
    const { token } = req.body;

    try {
      if(!token) {
        throw new HttpError(400, 'Bad Request', 'Token is required');
      }

      const payload = Auth.verifyJwt(token);
      const user = await this.repo.readById(payload.id);

      if(!user) {
        throw new HttpError(404, 'Not Found', 'User not found');
      }

      res.status(200).json({ message: 'Token valid', user });
    } catch(error) {
      next(new HttpError(401, 'Unauthorized', (error as Error).message));
    }
  } 

  async update(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;

    try {
      const { payload, ...data } = req.body as Partial<UserUpdateDto & { payload?: unknown }>;
      const { error } = userUpdateDtoSchema.validate(data);

      if (error) {
        next(new HttpError(400, 'Validation Error', error.details.map(detail => detail.message).join(', ')));
        return;
      }

      if (data.password) {
        data.password = await Auth.hash(data.password);
      }

      const updatedUser = await this.repo.update(id, data);
      res.json(updatedUser);
    } catch (error) {
      next(error);
    }
  }
}
