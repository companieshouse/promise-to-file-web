import {loadMockSession, loadCompanyAuthenticatedSession} from "../../../mock.utils";
import {loadSession} from "../../../../src/services/redis.service";
import * as request from "supertest";
import app from "../../../../src/app";
import {COOKIE_NAME} from "../../../../src/properties";

jest.mock("../../../../src/session/store/redis.store",
  () => import("../../../mocks/redis.store.mock.factory"));
jest.mock("../../../../src/services/redis.service");

const mockCacheService = loadSession as jest.Mock;

beforeEach(() => {
  mockCacheService.mockRestore();
  loadMockSession(mockCacheService);
});

describe("Web Security Middleware tests", () => {

  it("should redirect to account service if user signed in", async () => {
    const response = await request(app)
      .get("/promise-to-file/company/00006400/still-required")
      .set("Cookie", `${COOKIE_NAME}=123456789`);
    expect(response.status).toEqual(302);
  });

  it("should redirect to auth if user already authenticated for wrong company", async () => {
    loadCompanyAuthenticatedSession(mockCacheService, "00006401");
    const response = await request(app)
      .get("/promise-to-file/company/00006400/still-required")
      .set("Cookie", `${COOKIE_NAME}=123456789`);
    expect(response.status).toEqual(302);
  });

  it("should respond with 500 if invalid company number in path", async () => {
    const response = await request(app)
      .get("/promise-to-file/company/NOTACOMPANYNUMBER/still-required")
      .set("Cookie", `${COOKIE_NAME}=123456789`);
    expect(response.status).toEqual(500);
  });
});
