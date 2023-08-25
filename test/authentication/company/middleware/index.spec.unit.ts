import * as request from "supertest";
import app from "../../../../src/app";
import { COOKIE_NAME, OAUTH2_AUTH_URI } from "../../../../src/properties";
import { loadSession } from "../../../../src/services/redis.service";
import { loadCompanyAuthenticatedSession, loadMockSession } from "../../../mock.utils";
import { expect, jest } from "@jest/globals";

jest.mock("../../../../src/session/store/redis.store",
    () => import("../../../mocks/redis.store.mock.factory"));
jest.mock("../../../../src/services/redis.service");

const mockCacheService = loadSession as jest.Mock;
const authRegex = new RegExp(`${OAUTH2_AUTH_URI}*`);

beforeEach(() => {
    mockCacheService.mockRestore();
    loadMockSession(mockCacheService);
});

describe("Web Security Middleware tests", () => {

    it("should redirect to account service if user signed in", async () => {
        const response = await request(app)
            .get("/company-required/company/00006400/still-required")
            .set("Referer", "/")
            .set("Cookie", `${COOKIE_NAME}=123456789`)
            .expect("Location", authRegex);
        expect(response.status).toEqual(302);
    });

    it("should redirect to auth if user already authenticated for wrong company", async () => {
        loadCompanyAuthenticatedSession(mockCacheService, "00006401");
        const response = await request(app)
            .get("/company-required/company/00006400/still-required")
            .set("Referer", "/")
            .set("Cookie", `${COOKIE_NAME}=123456789`)
            .expect("Location", authRegex);
        expect(response.status).toEqual(302);
    });

    it("should respond with 500 if invalid company number in path", async () => {
        const response = await request(app)
            .get("/company-required/company/NOTACOMPANYNUMBER/still-required")
            .set("Referer", "/")
            .set("Cookie", `${COOKIE_NAME}=123456789`);
        expect(response.status).toEqual(500);
    });
});
