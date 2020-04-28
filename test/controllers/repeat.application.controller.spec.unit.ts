import * as request from "supertest";
import app from "../../src/app";
import { COOKIE_NAME } from "../../src/properties";
import { loadSession } from "../../src/services/redis.service";
import { getPromiseToFileSessionValue } from "../../src/services/session.service";
import { getDummyCompanyProfile, loadCompanyAuthenticatedSession, loadMockSession } from "../mock.utils";

jest.mock("../../src/session/store/redis.store", () => import("../mocks/redis.store.mock.factory"));
jest.mock("../../src/services/redis.service");
jest.mock("../../src/services/session.service");

const mockCacheService = loadSession as jest.Mock;
const mockGetPromiseToFileSessionValue = getPromiseToFileSessionValue as jest.Mock;

describe("repeat application page rendering", () => {

    it("should render page with correct text refering to company", async () => {
        loadMockSession(mockCacheService);
        loadCompanyAuthenticatedSession(mockCacheService, "00006400");
        mockGetPromiseToFileSessionValue.mockReset();
        mockGetPromiseToFileSessionValue.mockImplementationOnce(() => getDummyCompanyProfile(true, true));

        const response = await request(app)
            .get("/company-required/company/00006400/repeat-application")
            .set("Referer", "/")
            .set("Cookie", [`${COOKIE_NAME}=123`]);

        expect(response.text).toMatch(/We've already been told that THE GIRLS DAY SCHOOL TRUST is still required./);
    });
});
