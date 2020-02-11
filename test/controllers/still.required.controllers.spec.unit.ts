import * as request from "supertest";
import app from "../../src/app";
import {COOKIE_NAME} from "../../src/properties";
import {loadSession} from "../../src/services/redis.service";
import {getPromiseToFileSessionValue} from "../../src/services/session.service";
import {getDummyCompanyProfile, loadCompanyAuthenticatedSession, loadMockSession} from "../mock.utils";

jest.mock("../../src/session/store/redis.store", () => import("../mocks/redis.store.mock.factory"));
jest.mock("../../src/services/redis.service");
jest.mock("../../src/services/session.service");

const COMPANY_REQUIRED_NOT_SELECTED = "You must tell us if the company is still required";

describe("still required validation tests", () => {

  const mockCacheService = loadSession as jest.Mock;

  beforeEach(() => {
    loadMockSession(mockCacheService);
  });

  it("should create an error message when nothing is selected", async () => {
    loadCompanyAuthenticatedSession(mockCacheService, "00006400", "");
    const mockGetPromiseToFileSessionValue = getPromiseToFileSessionValue as jest.Mock;
    mockGetPromiseToFileSessionValue.mockReset();
    mockGetPromiseToFileSessionValue.mockImplementation(() => getDummyCompanyProfile(true, true));

    const response = await request(app)
      .post("/promise-to-file/company/00006400/still-required")
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(response.status).toEqual(200);
    expect(response.text).toContain("Tell us if THE GIRLS DAY SCHOOL TRUST is required");
    expect(response.text).toContain(COMPANY_REQUIRED_NOT_SELECTED);
  });
});
