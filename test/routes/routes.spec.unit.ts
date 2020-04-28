import * as request from "supertest";
import app from "../../src/app";
import { COOKIE_NAME } from "../../src/properties";
import { loadSession } from "../../src/services/redis.service";
import { getPromiseToFileSessionValue } from "../../src/services/session.service";
import { getDummyCompanyProfile, loadCompanyAuthenticatedSession, loadMockSession } from "../mock.utils";

jest.mock("../../src/session/store/redis.store", () => import("../mocks/redis.store.mock.factory"));
jest.mock("../../src/services/redis.service");
jest.mock("../../src/services/session.service");

const mockCacheService = loadSession as jest.Mock;
const mockGetPromiseToFileSessionValue = getPromiseToFileSessionValue as jest.Mock;

beforeEach(() => {
  loadMockSession(mockCacheService);
});

describe("Basic URL Tests", () => {

  it("should find start page", async () => {
    const response = await request(app)
      .get("/company-required")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(response.status).toEqual(200);
    expect(response.text).toMatch(/Use this service to tell us if you still require a company that has overdue filing/);
  });

  it("should return error code and page if requested page doesn't exist", async () => {
    const response = await request(app)
      .get("/gibberish");

    expect(response.status).toEqual(404);
    expect(response.text).toMatch(/Sorry, there is a problem with the service/);
  });

  it("should find the company number page", async () => {
    const response = await request(app)
      .get("/company-required/company-number")
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(response.status).toEqual(200);
    expect(response.text).toMatch(/What is the company number/);
  });

  it("should find the check company page", async () => {
    const response = await request(app)
      .get("/company-required/check-company")
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(response.status).toEqual(200);
    expect(response.text).toMatch(/Check company details/);
  });

  it("should find the warning page", async () => {
    loadCompanyAuthenticatedSession(mockCacheService, "00006400");
    mockGetPromiseToFileSessionValue.mockReset();
    mockGetPromiseToFileSessionValue.mockImplementation(() => getDummyCompanyProfile(true, true));

    const response = await request(app)
      .get("/company-required/company/00006400/warning")
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(response.status).toEqual(200);
    expect(response.text).toMatch(/Attention/);
  });

  it("should find the still required page", async () => {
    loadCompanyAuthenticatedSession(mockCacheService, "00006400");
    mockGetPromiseToFileSessionValue.mockReset();
    mockGetPromiseToFileSessionValue.mockImplementationOnce(() => getDummyCompanyProfile(true, true));
    mockGetPromiseToFileSessionValue.mockImplementationOnce(() => false);

    const response = await request(app)
      .get("/company-required/company/00006400/still-required")
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(response.status).toEqual(200);
    expect(response.text).toMatch(/Tell us if THE GIRLS DAY SCHOOL TRUST is required/);
  });

  it("should not find the still required page when submitted", async () => {
    loadCompanyAuthenticatedSession(mockCacheService, "00006400");
    mockGetPromiseToFileSessionValue.mockReset();
    mockGetPromiseToFileSessionValue.mockImplementationOnce(() => getDummyCompanyProfile(true, true));
    mockGetPromiseToFileSessionValue.mockImplementationOnce(() => true);

    const response = await request(app)
        .get("/company-required/company/00006400/still-required")
        .set("Referer", "/")
        .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(response.status).toEqual(302);
  });

});
