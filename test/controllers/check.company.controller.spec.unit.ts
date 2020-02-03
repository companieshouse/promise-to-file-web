import app from "../../src/app";
import * as request from "supertest";
import {loadSession} from "../../src/services/redis.service";
import {loadMockSession} from "../mock.utils";
import {COOKIE_NAME} from "../../src/properties";
import * as pageURLs from "../../src/model/page.urls";

jest.mock("../../src/session/store/redis.store", () => {
  return {
    default: {},
  };
});
jest.mock("../../src/services/redis.service");
jest.mock("../../src/logger");

describe("check company tests", () => {

  const mockCacheService = (loadSession as unknown as jest.Mock<typeof loadSession>);

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

  it("should render the page with dummy data", async () => {
    const response = await request(app).get(pageURLs.PROMISE_TO_FILE_CHECK_COMPANY)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(response.status).toEqual(200);
    expect(response.text).toContain("Test Company LTD");
    expect(response.text).toContain("00001111");
    expect(response.text).toContain("Active");
    expect(response.text).toContain("01 January 2000");
    expect(response.text).toContain("Private Limited Company");
    expect(response.text).toContain("25 No Street");
    expect(response.text).toContain("Nowhere");
    expect(response.text).toContain("nl2br");
    expect(response.text).toContain("01 January 2020");
    expect(response.text).toContain("Your accounts are overdue");
    expect(response.text).toContain("02 January 2020");
    expect(response.text).toContain("Your confirmation statement is overdue");
  });
});
