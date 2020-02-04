import Session from "../../../src/session/session";
import {ACCESS_TOKEN, loadMockSession} from "../../mock.utils";
import {loadSession} from "../../../src/services/redis.service";
import * as request from "supertest";
import app from "../../../src/app";
import {COOKIE_NAME} from "../../../src/properties";
import * as keys from "../../../src/session/keys";

jest.mock("../../../src/services/redis.service");

const mockCacheService = (loadSession as unknown as jest.Mock<typeof loadSession>);

beforeEach(() => {
  mockCacheService.mockRestore();
  loadMockSession(mockCacheService);
});

jest.mock("../../../src/session/store/redis.store", () => {
  return {
    default: {},
  };
});

describe("Web Security Middleware tests", () => {

  it("should redirect to account service if user signed in", async () => {
    const response = await request(app)
      .get("/promise-to-file/company/00006400/continue-trading")
      .set("Cookie", `${COOKIE_NAME}=123456789`);
    expect(response.status).toEqual(302);
  });

  it("should continue to original url if user already authenticated for company", async () => {
    loadCompanyAuthenticatedSession(mockCacheService, "00006400");
    const response = await request(app)
      .get("/promise-to-file/company/00006400/continue-trading")
      .set("Cookie", `${COOKIE_NAME}=123456789`);
    expect(response.status).toEqual(200);
  });

  it("should redirect to auth if user already authenticated for wrong company", async () => {
    loadCompanyAuthenticatedSession(mockCacheService, "00006401");
    const response = await request(app)
      .get("/promise-to-file/company/00006400/continue-trading")
      .set("Cookie", `${COOKIE_NAME}=123456789`);
    expect(response.status).toEqual(302);
  });

  it("should respond with 500 if invalid company number in path", async () => {
    const response = await request(app)
      .get("/promise-to-file/company/NOTACOMPANYNUMBER/continue-trading")
      .set("Cookie", `${COOKIE_NAME}=123456789`);
    expect(response.status).toEqual(500);
  });
});

const loadCompanyAuthenticatedSession = (mockLoadSessionFunction: jest.Mock<typeof loadSession>,
                                         companyNumber?: string): void => {
  mockLoadSessionFunction.prototype.constructor.mockImplementation(async (cookieId) => {
    const session = Session.newWithCookieId(cookieId);
    session.data = {
      [keys.SIGN_IN_INFO]: {
        [keys.SIGNED_IN]: 1,
        [keys.COMPANY_NUMBER]: companyNumber,
      },
    };
    return session;
  });
};
