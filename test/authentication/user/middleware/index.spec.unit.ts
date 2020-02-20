import * as request from "supertest";
import app from "../../../../src/app";
import { COOKIE_NAME } from "../../../../src/properties";
import { loadSession } from "../../../../src/services/redis.service";
import * as keys from "../../../../src/session/keys";
import Session from "../../../../src/session/session";
import { loadMockSession } from "../../../mock.utils";

jest.mock("../../../../src/session/store/redis.store",
  () => import("../../../mocks/redis.store.mock.factory"));
jest.mock("../../../../src/services/redis.service");

const mockCacheService = loadSession as jest.Mock;

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
      .expect("Location", "/signin?return_to=/promise-to-file");
    expect(response.status).toEqual(302);
  });
});

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
