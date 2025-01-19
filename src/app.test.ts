import { type PrismaClient } from "@prisma/client";
import { createApp, startApp } from "./app"


describe('Given the function createApp', () => {
  test('Then it should be call and return app', () => {
    const app = createApp();
    expect(app).toBeDefined();
  });
});

describe('Given the function startApp', () => {
  describe('When we call it', () => {
    test('Then it call app.use', () => {
      const app = createApp();
      jest.spyOn(app, 'use');
      const prisma = {} as unknown as PrismaClient;
      startApp(app, prisma);
      expect(app.use).toHaveBeenCalled();
    });
  });
});
