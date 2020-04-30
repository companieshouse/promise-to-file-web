import * as request from "supertest";
import app from "../../../src/app";
import { COOKIE_NAME } from "../../../src/properties";
import { loadSession } from "../../../src/services/redis.service";
import { loadMockSession } from "../../mock.utils";

jest.mock("../../../src/session/store/redis.store", () => import("../../mocks/redis.store.mock.factory"));
jest.mock("../../../src/services/redis.service");
jest.mock("../../../src/services/session.service");
const mockCacheService = loadSession as jest.Mock;

beforeEach(() => {
  loadMockSession(mockCacheService);
});

afterAll(() => {
  process.env.SHOW_SERVICE_UNAVAILABLE_PAGE = "off";
});

const UNAVAILABLE_TEXT = "service is unavailable";

describe("Availability tests", () => {

  it("should show the service unavailable page", async () => {
    process.env.SHOW_SERVICE_UNAVAILABLE_PAGE = "on";

    const response = await request(app)
      .get("/company-required");
    expect(response.text).toContain(UNAVAILABLE_TEXT);
  });

  it("should show the service unavailable page with slash", async () => {
    process.env.SHOW_SERVICE_UNAVAILABLE_PAGE = "on";

    const response = await request(app)
      .get("/company-required/");
    expect(response.text).toContain(UNAVAILABLE_TEXT);
  });

  it("should show the service unavailable page for non start page", async () => {
    process.env.SHOW_SERVICE_UNAVAILABLE_PAGE = "on";

    const response = await request(app)
      .get("/company-required/company-number");
    expect(response.text).toContain(UNAVAILABLE_TEXT);
  });

  it("should NOT show the service unavailable page", async () => {
    process.env.SHOW_SERVICE_UNAVAILABLE_PAGE = "off";

    const response = await request(app)
      .get("/company-required")
      .set("Cookie", [`${COOKIE_NAME}=123`]);
    expect(response.text).not.toContain(UNAVAILABLE_TEXT);
    expect(response.text).toContain("tell us if you still require a company that has overdue filing");
  });
});
