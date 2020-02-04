import Session from "../../../src/session/session";
import {loadMockSession} from "../../mock.utils";
import {loadSession} from "../../../src/services/redis.service";
import * as request from "supertest";
import app from "../../../src/app";
import {COOKIE_NAME} from "../../../src/properties";
import * as keys from "../../../src/session/keys";

jest.mock("../../../src/services/redis.service");

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

jest.mock("../../../src/session/store/redis.store", () => {
  return {
    default: {},
  };
});

describe("Web Security Middleware tests", () => {

  it("should redirect to account service if user signed in", async () => {
    const response = await request(app)
      .get("/promise-to-file/company/00006400/")
      .set("Cookie", `${COOKIE_NAME}=123456789`);
    expect(response.status).toEqual(302);
  });

  it("should continue to original url if user already authenticated", async () => {
    signInToCompany("00006400");

    const response = await request(app)
      .get("/promise-to-file/company/00006400/")
      .set("Cookie", `${COOKIE_NAME}=123456789`);
    expect(response.status).toEqual(200);
  });

  it("should respond with 500 if invalid company number in path", async () => {
    const response = await request(app)
      .get("/promise-to-file/company/NOTACOMPANYNUMBER/")
      .set("Cookie", `${COOKIE_NAME}=123456789`);
    expect(response.status).toEqual(500);
  });

  it("should redirect to auth if the user has session but is not signed in", async () => {
    setNotSignedIn();

    const response = await request(app)
      .get("/promise-to-file/company/00006400/")
      .set("Cookie", `${COOKIE_NAME}=123456789`);
    expect(response.status).toEqual(302);
  });

  it("should respond with 500 if the user has no session", async () => {
    setNotSignedIn();

    const response = await request(app)
      .get("/promise-to-file/company/00006400/")
    expect(response.status).toEqual(500);
  });
});

const signInToCompany = (companyNumber: string) => {
  mockCacheService.prototype.constructor.mockImplementationOnce((cookieId) => {
    const session: Session = Session.newWithCookieId(cookieId);
    session.data = {
      [keys.SIGN_IN_INFO]: {
        [keys.COMPANY_NUMBER]: companyNumber,
      },
    };
    return session;
  });
};

const setNotSignedIn = () => {
  mockCacheService.prototype.constructor.mockImplementationOnce((cookieId) => {
    const session: Session = Session.newWithCookieId(cookieId);
    session.data = {
      [keys.SIGN_IN_INFO]: {
        [keys.SIGNED_IN]: 0,
      },
    };
    return session;
  });
};