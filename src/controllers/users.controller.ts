import createDebug from 'debug';
import { NextFunction, Request, Response } from "express";
import { UsersSqlRepo } from "../repositories/users.sql.repo.js";

const debug = createDebug('PIM:users:controller');

export class UsersController {
  constructor(private readonly usersRepo: UsersSqlRepo) {
    debug('Instantiated user controller');
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await this.usersRepo.readAll();
      res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  }
}
