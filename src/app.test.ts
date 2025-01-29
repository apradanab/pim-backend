process.env.SENDGRID_API_KEY = 'SG.mock-sendgrid-api-key';

import { type PrismaClient } from "@prisma/client";
import request from "supertest";
import { createApp, startApp } from "./app";

describe("Given the function createApp", () => {
  test("Then it should be called and return an app instance", () => {
    const app = createApp();
    expect(app).toBeDefined();
  });
});

describe("Given the function startApp", () => {
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    app = createApp();
  });

  test("Then it should call app.use", () => {
  const prisma = {} as unknown as PrismaClient;
  jest.spyOn(app, "use");

  startApp(app, prisma);
  expect(app.use).toHaveBeenCalled();
  });

  test("Then it should respond with API status", async () => {
    startApp(app, {} as PrismaClient);
    const response = await request(app).get("/");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "API is running" });
  });
});
