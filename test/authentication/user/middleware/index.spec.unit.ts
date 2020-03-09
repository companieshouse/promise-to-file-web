import { json } from "express";
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

const INDEX_STRING: string = "Use this service to tell us if you still require a company that has overdue filing.";
const COMPANY_NUMBER_STRING: string = "What is the company number?";

const mockCacheService = loadSession as jest.Mock;

beforeEach(() => {
  mockCacheService.mockRestore();
  loadMockSession(mockCacheService);
});

describe("Authentication middleware", () => {

  it("should load start page with no referrer and not signed in", async () => {
    setNotSignedIn();
    const response = await request(app)
      .get("/promise-to-file");
    expect(response.status).toEqual(200);
    expect(response.text).toContain(INDEX_STRING);
  });

  it("should load start page if loading start page with trailing slash", async () => {
    const response = await request(app)
      .get("/promise-to-file/")
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);
    expect(response.status).toEqual(200);
    expect(response.text).toContain(INDEX_STRING);
  });

  it("should redirect to start page if loading start page with trailing slash and no referrer", async () => {
    const response = await request(app)
      .get("/promise-to-file/")
      .set("Cookie", [`${COOKIE_NAME}=123`])
      .expect("Location", "/promise-to-file");
    expect(response.status).toEqual(302);
  });

  it("should not redirect to start page if user has referrer and is signed in", async () => {
    const response = await request(app)
      .get("/promise-to-file/company-number")
      .set("Referer", "/promise-to-file/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);
    expect(response.status).toEqual(200);
    expect(response.text).toContain(COMPANY_NUMBER_STRING);
  });

  it("should redirect to signin if /promise-to-file/* called and not signed in", async () => {
    setNotSignedIn();
    const response = await request(app)
      .get("/promise-to-file/company-number")
      .set("Referer", "/promise-to-file/")
      .expect("Location", "/signin?return_to=/promise-to-file");
    expect(response.status).toEqual(302);
  });

  it("should not redirect to signin if loading start page and not signed in", async () => {
    setNotSignedIn();
    const response = await request(app)
      .get("/promise-to-file")
      .set("Referer", "/");
    expect(response.status).toEqual(200);
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
      .set("Referer", "/promise-to-file")
      .set("Cookie", [`${COOKIE_NAME}=123`]);
    expect(response.status).toEqual(200);
  });

  it("should redirect to sign in screen if /promise-to-file/* called from outside of the PTF journey and not signed in",
      async () => {
    setNotSignedIn();
    const response = await request(app)
      .get("/promise-to-file/company-number")
      .set("Referer", "/")
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
