import * as request from "supertest";
import app from "../../../../src/app";
import { COOKIE_NAME } from "../../../../src/properties";
import { loadSession } from "../../../../src/services/redis.service";
import * as keys from "../../../../src/session/keys";
import Session from "../../../../src/session/session";
import { loadMockSession } from "../../../mock.utils";
import { expect, jest } from "@jest/globals";

jest.mock("../../../../src/session/store/redis.store",
    () => import("../../../mocks/redis.store.mock.factory"));
jest.mock("../../../../src/services/redis.service");
jest.mock("ioredis", () => require("ioredis-mock"));

const INDEX_TITLE: string = "Tell us if a company is still required";
const COMPANY_NUMBER_TITLE: string = "Tell us your company number";

const mockCacheService = loadSession as jest.Mock;

beforeEach(() => {
    mockCacheService.mockRestore();
    loadMockSession(mockCacheService);
});

describe("Authentication middleware", () => {

    it("should load start page with no referer and not signed in", async () => {
        setNotSignedIn();
        const response = await request(app)
            .get("/company-required");
        expect(response.status).toEqual(200);
        expect(response.text).toContain(INDEX_TITLE);
    });

    it("should load start page if loading start page with trailing slash", async () => {
        const response = await request(app)
            .get("/company-required/")
            .set("Referer", "/")
            .set("Cookie", [`${COOKIE_NAME}=123`]);
        expect(response.status).toEqual(200);
        expect(response.text).toContain(INDEX_TITLE);
    });

    it("should redirect to start page if loading start page with trailing slash and no referer", async () => {
        const response = await request(app)
            .get("/company-required/")
            .set("Cookie", [`${COOKIE_NAME}=123`])
            .expect("Location", "/company-required");
        expect(response.status).toEqual(302);
    });

    it("should not redirect to start page if user has referer and is signed in", async () => {
        const response = await request(app)
            .get("/company-required/company-number")
            .set("Referer", "/company-required/")
            .set("Cookie", [`${COOKIE_NAME}=123`]);
        expect(response.status).toEqual(200);
        expect(response.text).toContain(COMPANY_NUMBER_TITLE);
    });

    it("should redirect to signin if /company-required/* called and not signed in", async () => {
        setNotSignedIn();
        const response = await request(app)
            .get("/company-required/company-number")
            .set("Referer", "/company-required/")
            .expect("Location", "/signin?return_to=/company-required");
        expect(response.status).toEqual(302);
    });

    it("should not redirect to signin if loading start page and not signed in", async () => {
        setNotSignedIn();
        const response = await request(app)
            .get("/company-required")
            .set("Referer", "/");
        expect(response.status).toEqual(200);
        expect(response.text).toContain(INDEX_TITLE);
    });

    it("should redirect to signin if navigating from /company-required page and not signed in", async () => {
        setNotSignedIn();
        const response = await request(app)
            .get("/company-required/company-number")
            .set("Referer", "/company-required")
            .expect("Location", "/signin?return_to=/company-required/company-number");
        expect(response.status).toEqual(302);
    });

    it("should not redirect to signin if /company-required/* called while signed in", async () => {
        const response = await request(app)
            .get("/company-required/company-number")
            .set("Referer", "/company-required")
            .set("Cookie", [`${COOKIE_NAME}=123`]);
        expect(response.status).toEqual(200);
        expect(response.text).toContain(COMPANY_NUMBER_TITLE);
    });

    it("should redirect to sign in screen if /company-required/* " +
      "called from outside of the PTF journey and not signed in",
    async () => {
        setNotSignedIn();
        const response = await request(app)
            .get("/company-required/company-number")
            .set("Referer", "/")
            .expect("Location", "/signin?return_to=/company-required");
        expect(response.status).toEqual(302);
    });
});

const setNotSignedIn = () => {
    mockCacheService.prototype.constructor.mockImplementationOnce((cookieId) => {
        const session: Session = Session.newWithCookieId(cookieId);
        session.data = {
            [keys.SIGN_IN_INFO]: {
                [keys.SIGNED_IN]: 0
            }
        };
        return session;
    });
};
