import {loadSession} from "../../src/services/redis.service";
import app from "../../src/app";
import * as request from "supertest";
import {getDummyCompanyProfile, loadMockSession} from "../mock.utils";
import {COOKIE_NAME} from "../../src/properties";
import {getPromiseToFileSessionValue} from "../../src/services/session.service";

jest.mock("../../src/session/store/redis.store", () => import("../mocks/redis.store.mock.factory"));
jest.mock("../../src/services/redis.service");
jest.mock("../../src/services/session.service");

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

  it("should return error code and page if requested page doesn't exist", async () => {
    const response = await request(app)
      .get("/gibberish");

    expect(response.status).toEqual(404);
    expect(response.text).toMatch(/Sorry, there is a problem with the service/);
  });

  it("should find the company number page", async () => {
    const response = await request(app)
      .get("/promise-to-file/company-number")
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(response.status).toEqual(200);
    expect(response.text).toMatch(/What is the company number/);
  });

  it("should find the check company page", async () => {
    const response = await request(app)
      .get("/promise-to-file/check-company")
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(response.status).toEqual(200);
    expect(response.text).toMatch(/Check company details/);
  });

  it("should find the still required page", async () => {
    const mockGetPromiseToFileSessionValue = getPromiseToFileSessionValue as jest.Mock;
    mockGetPromiseToFileSessionValue.mockReset();
    mockGetPromiseToFileSessionValue.mockImplementation(() => getDummyCompanyProfile(true, true));

    const response = await request(app)
      .get("/promise-to-file/still-required")
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(response.status).toEqual(200);
    expect(response.text).toMatch(/Tell us if GIRLS TRUST is required/);
  });
});
