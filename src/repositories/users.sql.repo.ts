import { PrismaClient } from "@prisma/client";
import createDebug from 'debug';

const debug = createDebug('PIM:users:repo:sql');

const select = {
  id: true,
  email: true,
}

export class UsersSqlRepo {
  constructor(private readonly prisma: PrismaClient) {
    debug('Instantiated users sql repository')
  }

  async readAll() {
    return this.prisma.user.findMany({select});
  }
}
