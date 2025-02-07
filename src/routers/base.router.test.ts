import { type BaseController } from "../controllers/base.controller"
import { type AuthInterceptor } from "../middlewares/auth.interceptor";
import { BaseRouter } from "./base.router";

type MockEntity = { id: string; name: string };
type MockCreateDto = { name: string }; 

class TestRouter extends BaseRouter<MockEntity, MockCreateDto> {
  constructor(controller: BaseController<MockEntity, MockCreateDto>, authInterceptor: AuthInterceptor) {
    super(controller, authInterceptor);
  }
}

describe('Given an instance of the class BaseRouter', () => {
  const controller = {
    getAll: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  } as unknown as BaseController<MockEntity, MockCreateDto>;

  const authInterceptor = {
    authentication: jest.fn(),
    isAdmin: jest.fn(),
  } as unknown as AuthInterceptor;

  const router = new TestRouter(controller, authInterceptor);

  test('Then it should be an instance of BaseRouter', () => {
    expect(router).toBeInstanceOf(BaseRouter);
  });
})
