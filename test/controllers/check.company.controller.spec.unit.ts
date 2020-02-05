import app from "../../src/app";
import * as request from "supertest";
import {loadSession} from "../../src/services/redis.service";
import {loadMockSession} from "../mock.utils";
import {COOKIE_NAME} from "../../src/properties";
import * as pageURLs from "../../src/model/page.urls";
import * as mockUtils from "../mock.utils";
import {getPromiseToFileSessionValue} from "../../src/services/session.service";
import {COMPANY_PROFILE} from "../../src/session/keys";
import Session from "../../src/session/session";

jest.mock("../../src/session/store/redis.store", () => import("../mocks/redis.store.mock.factory"));
jest.mock("../../src/services/redis.service");
jest.mock("../../src/services/session.service");

describe("check company tests", () => {

  const mockCacheService = loadSession as jest.Mock;

  beforeEach(() => {
    loadMockSession(mockCacheService);
  });

  it("should find check company page", async () => {
    const response = await request(app)
      .get("/promise-to-file/check-company")
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(response.status).toEqual(200);
    expect(response.text).toMatch(/Check company details/);
  });

  it("should render the page with company data from the session", async () => {

    const mockGetPromiseToFileSessionValue = getPromiseToFileSessionValue as jest.Mock;

    mockGetPromiseToFileSessionValue.mockReset();
    mockGetPromiseToFileSessionValue.mockImplementation(() => mockUtils.getDummyCompanyProfile(true, true));

    const response = await request(app).get(pageURLs.PROMISE_TO_FILE_CHECK_COMPANY)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(mockGetPromiseToFileSessionValue).toHaveBeenCalledTimes(1);
    expect(mockGetPromiseToFileSessionValue).toHaveBeenCalledWith(expect.any(Session), COMPANY_PROFILE);

    expect(response.status).toEqual(200);

    expect(response.text).toContain("GIRLS TRUST");
    expect(response.text).toContain("00006400");
    expect(response.text).toContain("Active");
    expect(response.text).toContain("23 September 1973");
    expect(response.text).toContain("Limited");
    expect(response.text).toContain("123");
    expect(response.text).toContain("street");
    expect(response.text).toContain("CF1 123");
    expect(response.text).toContain("2019-05-12");
    expect(response.text).toContain("Your accounts are overdue");
    expect(response.text).toContain("2019-09-03");
    expect(response.text).toContain("Your confirmation statement is overdue");
  });
});
