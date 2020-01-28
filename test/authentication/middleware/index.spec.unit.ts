import * as request from "supertest";
import app from "../../../src/app";
import {COOKIE_NAME} from "../../../src/properties";
import * as keys from "../../../src/session/keys";
import {loadSession} from "../../../src/services/redis.service";
import {loadMockSession} from "../../mock.utils";
import Session from "../../../src/session/session";

jest.mock("../../../src/services/redis.service");

const mockCacheService = (loadSession as unknown as jest.Mock<typeof loadSession>);

beforeEach(() => {
  mockCacheService.mockRestore();
  loadMockSession(mockCacheService);
});

describe("Authentication middleware", () => {

  it("should not redirect to signin if loading start page", async () => {
    const response = await request(app)
      .get("/promise-to-file");
    expect(response.status).toEqual(200);
  });

  it("should redirect to start page if loading start page with trailing slash", async () => {
    const response = await request(app)
      .get("/promise-to-file/");
    expect(response.status).toEqual(200);
  });

  it("should redirect to signin if /promise-to-file/* called and not signed in", async () => {
    setNotSignedIn();
    const response = await request(app)
      .get("/promise-to-file/company-number")
      .set("Referer", "/promise-to-file/company-number")
      .expect("Location", "/signin?return_to=/promise-to-file");
    expect(response.status).toEqual(302);
  });

  it("should redirect to signin if navigating from /promise-to-file page and not signed in", async () => {
    setNotSignedIn();
    const response = await request(app)
      .get("/promise-to-file/company-number")
      .set("Referer", "/promise-to-file")
      .expect("Location", "/signin?return_to=/promise-to-file/company-number");
    expect(response.status).toEqual(302);
  });

  it("should not redirect to signin if /promise-to-file/* called while signed in", async () => {
    const response = await request(app)
      .get("/promise-to-file/company-number")
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);
    expect(response.status).toEqual(200);
  });

  it("should redirect to start screen if /promise-to-file/* called from outside of the PTF journey and not signed in",
      async () => {
    setNotSignedIn();
    const response = await request(app)
      .get("/promise-to-file/company-number")
      .expect("Location", "/promise-to-file");
    expect(response.status).toEqual(302);
  });
});

const setNotSignedIn = () => {
  mockCacheService.prototype.constructor.mockImplementationOnce((cookieId) => {
    const session: Session = Session.newWithCookieId(cookieId);
    session.data = {
      [keys.COMPANY_NUMBER]: "00006400",
      [keys.SIGN_IN_INFO]: {
        [keys.SIGNED_IN]: 0,
      },
    };
    return session;
  });
};
