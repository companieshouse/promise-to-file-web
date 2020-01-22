import app from "../../src/app";
import * as request from "supertest";
import {loadSession} from "../../src/services/redis.service";
import {loadMockSession} from "../mock.utils";
import Session from "../../src/session/session";

jest.mock("../../src/services/redis.service");

const mockCacheService = (<unknown>loadSession as jest.Mock<typeof loadSession>);

beforeEach(() => {
  loadMockSession(mockCacheService);
  mockCacheService.mockClear();
  mockCacheService.prototype.constructor.mockImplementationOnce((cookieId) => {
    const session: Session = Session.newWithCookieId(cookieId);
    session.data = {};
    return session;
  });
});

describe("Basic URL Tests", () => {

  it("should find start page", async () => {
    const response = await request(app)
      .get("/promise-to-file");

    expect(response.status).toEqual(200);
    expect(response.text).toMatch(/Use this service to stop us from removing a company/);
  });

  it("should find company number page", async () => {
    const response = await request(app)
      .get("/promise-to-file/company-number")

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
