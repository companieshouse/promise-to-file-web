import app from "../../src/app";
import * as request from "supertest";
import {loadSession} from "../../src/services/redis.service";
import {loadMockSession} from "../mock.utils";
import {COOKIE_NAME} from "../../src/properties";
import * as pageURLs from "../../src/model/page.urls"
import Session from "../../src/session/session";

jest.mock("../../src/services/redis.service");

const NO_COMPANY_NUMBER_SUPPLIED = "No company number supplied";
const INVALID_COMPANY_NUMBER = "Invalid company number";
const COMPANY_NUMBER_TOO_LONG = "Company number too long";

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

describe("company number validation tests", () => {

    it("should create an error message when no company number is supplied (empty string)", async() => {
        const response = await request(app)
            .post(pageURLs.PROMISE_TO_FILE_COMPANY_NUMBER)
            .set("Accept", "application/json")
            .set("Cookie", [`${COOKIE_NAME}=123`])
            .send({companyNumber: ""});

        expect(response.status).toEqual(200);
        expect(response).not.toBeUndefined();

        expect(response.text).toContain(NO_COMPANY_NUMBER_SUPPLIED);
        expect(response.text).not.toContain(INVALID_COMPANY_NUMBER);
        expect(response.text).not.toContain(COMPANY_NUMBER_TOO_LONG);
    });

    it("should create an error message when no company number is supplied (spaces)", async() => {
        const response = await request(app)
            .post(pageURLs.PROMISE_TO_FILE_COMPANY_NUMBER)
            .set("Accept", "application/json")
            .set("Cookie", [`${COOKIE_NAME}=123`])
            .send({companyNumber: "    "});

        expect(response.status).toEqual(200);
        expect(response).not.toBeUndefined();
        expect(response.text).toContain(NO_COMPANY_NUMBER_SUPPLIED);
        expect(response.text).not.toContain(INVALID_COMPANY_NUMBER);
        expect(response.text).not.toContain(COMPANY_NUMBER_TOO_LONG);
    });

    it("should create an error message when company number is invalid (characters)", async() => {
        const response = await request(app)
            .post(pageURLs.PROMISE_TO_FILE_COMPANY_NUMBER)
            .set("Accept", "application/json")
            .set("Cookie", [`${COOKIE_NAME}=123`])
            .send({companyNumber: "asdfg!!@"});

        expect(response.status).toEqual(200);
        expect(response).not.toBeUndefined();
        expect(response.text).not.toContain(NO_COMPANY_NUMBER_SUPPLIED);
        expect(response.text).toContain(INVALID_COMPANY_NUMBER);
        expect(response.text).not.toContain(COMPANY_NUMBER_TOO_LONG);
    });

    it("should create an error message when company number is too long", async() => {
        const response = await request(app)
            .post(pageURLs.PROMISE_TO_FILE_COMPANY_NUMBER)
            .set("Accept", "application/json")
            .set("Cookie", [`${COOKIE_NAME}=123`])
            .send({companyNumber: "000064000"});

        expect(response.status).toEqual(200);
        expect(response).not.toBeUndefined();
        expect(response.text).not.toContain(NO_COMPANY_NUMBER_SUPPLIED);
        expect(response.text).not.toContain(INVALID_COMPANY_NUMBER);
        expect(response.text).toContain(COMPANY_NUMBER_TOO_LONG);
    });
});
