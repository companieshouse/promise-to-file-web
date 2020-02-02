import {loadSession} from "../../src/services/redis.service";
import app from "../../src/app";
import * as request from "supertest";
import {loadMockSession} from "../mock.utils";
import {COOKIE_NAME} from "../../src/properties";

jest.mock("../../src/session/store/redis.store", () => {
  return {
    default: {},
  };
});
jest.mock("../../src/services/redis.service");
jest.mock("../../src/logger");

const mockCacheService = loadSession as jest.Mock;

beforeEach(() => {
  loadMockSession(mockCacheService);
});

describe("Basic URL Tests", () => {

  it("should find start page", async () => {
    const response = await request(app)
      .get("/promise-to-file")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(response.status).toEqual(200);
    expect(response.text).toMatch(/Use this service to stop us from removing a company/);
  });

  it("should find company number page", async () => {

    const response = await request(app)
      .get("/promise-to-file/company-number")
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(response.status).toEqual(200);
    expect(response.text).toMatch(/What is the company number/);
  });

  it("should return error code and page if requested page doesn't exist", async () => {
    const response = await request(app)
      .get("/gibberish");

    expect(response.status).toEqual(404);
    expect(response.text).toMatch(/Sorry, there is a problem with the service/);
  });
});
