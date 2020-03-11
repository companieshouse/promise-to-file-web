import * as request from "supertest";
import app from "../../src/app";
import { COOKIE_NAME } from "../../src/properties";
import { loadSession } from "../../src/services/redis.service";
import { getPromiseToFileSessionValue, updatePromiseToFileSessionValue } from "../../src/services/session.service";
import { IS_STILL_REQUIRED } from "../../src/session/keys";
import { buildDummySession, getDummyCompanyProfile, loadCompanyAuthenticatedSession, loadMockSession } from "../mock.utils";

jest.mock("../../src/session/store/redis.store", () => import("../mocks/redis.store.mock.factory"));
jest.mock("../../src/services/redis.service");
jest.mock("../../src/services/session.service");

const COMPANY_REQUIRED_NOT_SELECTED = "You must tell us if the company is still required";

describe("still required validation and session tests", () => {

  const mockCacheService = loadSession as jest.Mock;
  const mockGetPromiseToFileSessionValue = getPromiseToFileSessionValue as jest.Mock;
  const mockUpdatePromiseToFileSessionValue  = updatePromiseToFileSessionValue as jest.Mock;

  it("should create an error message when nothing is selected", async () => {
    mockCacheService.mockClear();
    loadMockSession(mockCacheService);
    loadCompanyAuthenticatedSession(mockCacheService, "00006400");
    mockGetPromiseToFileSessionValue.mockReset();
    mockGetPromiseToFileSessionValue.mockImplementation(() => getDummyCompanyProfile(true, true));

    const response = await request(app)
      .post("/company-required/company/00006400/still-required")
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(response.status).toEqual(200);
    expect(response.text).toContain("Tell us if THE GIRLS DAY SCHOOL TRUST is required");
    expect(response.text).toContain(COMPANY_REQUIRED_NOT_SELECTED);
  });

  it("should update session when yes is selected", async () => {
    const response = await request(app)
        .post("/company-required/company/00006400/still-required")
        .set("Referer", "/")
        .set("Cookie", [`${COOKIE_NAME}=123`])
        .send({stillRequired: "yes"});

    expect(response.status).toEqual(302);
    expect(mockUpdatePromiseToFileSessionValue).
    toHaveBeenCalledWith(buildDummySession("123", "00006400"), IS_STILL_REQUIRED, true);
  });

  it("should update session when yEs is selected", async () => {
    const response = await request(app)
        .post("/company-required/company/00006400/still-required")
        .set("Referer", "/")
        .set("Cookie", [`${COOKIE_NAME}=123`])
        .send({stillRequired: "yEs"});

    expect(response.status).toEqual(302);
    expect(mockUpdatePromiseToFileSessionValue).
    toHaveBeenCalledWith(buildDummySession("123", "00006400"), IS_STILL_REQUIRED, true);
  });

  it("should update session when no is selected", async () => {

    const response = await request(app)
        .post("/company-required/company/00006400/still-required")
        .set("Referer", "/")
        .set("Cookie", [`${COOKIE_NAME}=123`])
        .send({stillRequired: "no"});

    expect(response.status).toEqual(302);
    expect(mockUpdatePromiseToFileSessionValue).
    toHaveBeenCalledWith(buildDummySession("123", "00006400"), IS_STILL_REQUIRED, false);
  });

  it("should update session when nO is selected", async () => {

    const response = await request(app)
        .post("/company-required/company/00006400/still-required")
        .set("Referer", "/")
        .set("Cookie", [`${COOKIE_NAME}=123`])
        .send({stillRequired: "nO"});

    expect(response.status).toEqual(302);
    expect(mockUpdatePromiseToFileSessionValue).
    toHaveBeenCalledWith(buildDummySession("123", "00006400"), IS_STILL_REQUIRED, false);
  });

});
