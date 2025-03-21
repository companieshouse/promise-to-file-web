import * as request from "supertest";
import app from "../../src/app";
import { getCompanyProfile } from "../../src/client/apiclient";
import { COMPANY_REQUIRED_CHECK_COMPANY, COMPANY_REQUIRED_COMPANY_NUMBER } from "../../src/model/page.urls";
import { COOKIE_NAME } from "../../src/properties";
import { loadSession } from "../../src/services/redis.service";
import { updatePromiseToFileSessionValue } from "../../src/services/session.service";
import { COMPANY_PROFILE } from "../../src/session/keys";
import Session from "../../src/session/session";
import { ACCESS_TOKEN, getDummyCompanyProfile, loadMockSession } from "../mock.utils";
import { expect, jest } from "@jest/globals";
import PromiseError from "../../src/utils/error";

jest.mock("../../src/session/store/redis.store", () => import("../mocks/redis.store.mock.factory"));
jest.mock("../../src/services/redis.service");
jest.mock("../../src/client/apiclient");
jest.mock("../../src/services/session.service");
jest.mock("@companieshouse/web-security-node");
jest.mock("../../src/csrf.middleware", () => ({
  createCsrfProtectionMiddleware: jest.fn(() => (req, res, next) => next()),
  csrfErrorHandler: jest.fn(() => (err, req, res, next) => next(err)),
}));
jest.mock("ioredis", () => require("ioredis-mock"));

const COMPANY_NUMBER = "00006400";
const NO_COMPANY_NUMBER_SUPPLIED = "No company number supplied";
const INVALID_COMPANY_NUMBER = "Invalid company number";
const COMPANY_NUMBER_TOO_LONG = "Company number too long";
const COMPANY_NOT_FOUND: string = "Company number not found";
const ERROR_PAGE: string = "Sorry, there is a problem with the service";

describe("company number validation tests", () => {

    const mockCacheService = loadSession as jest.Mock;
    const mockCompanyProfile = getCompanyProfile as jest.Mock;

    beforeEach(() => {
        loadMockSession(mockCacheService);
    });

    it("should create an error message when no company number is supplied (empty string)", async () => {
        const response = await request(app)
            .post(COMPANY_REQUIRED_COMPANY_NUMBER)
            .set("Accept", "application/json")
            .set("Referer", "/")
            .set("Cookie", [`${COOKIE_NAME}=123`])
            .send({ companyNumber: "" });

        expect(response.status).toEqual(200);
        expect(response).not.toBeUndefined();
        expect(response.text).toContain(NO_COMPANY_NUMBER_SUPPLIED);
        expect(response.text).not.toContain(INVALID_COMPANY_NUMBER);
        expect(response.text).not.toContain(COMPANY_NUMBER_TOO_LONG);
    });

    it("should create an error message when no company number is supplied (spaces)", async () => {
        const response = await request(app)
            .post(COMPANY_REQUIRED_COMPANY_NUMBER)
            .set("Accept", "application/json")
            .set("Referer", "/")
            .set("Cookie", [`${COOKIE_NAME}=123`])
            .send({ companyNumber: "    " });

        expect(response.status).toEqual(200);
        expect(response).not.toBeUndefined();
        expect(response.text).toContain(NO_COMPANY_NUMBER_SUPPLIED);
        expect(response.text).not.toContain(INVALID_COMPANY_NUMBER);
        expect(response.text).not.toContain(COMPANY_NUMBER_TOO_LONG);
    });

    it("should create an error message when company number is invalid (characters)", async () => {
        const response = await request(app)
            .post(COMPANY_REQUIRED_COMPANY_NUMBER)
            .set("Accept", "application/json")
            .set("Referer", "/")
            .set("Cookie", [`${COOKIE_NAME}=123`])
            .send({ companyNumber: "asdfg!!@" });

        expect(response.status).toEqual(200);
        expect(response).not.toBeUndefined();
        expect(response.text).not.toContain(NO_COMPANY_NUMBER_SUPPLIED);
        expect(response.text).toContain(INVALID_COMPANY_NUMBER);
        expect(response.text).not.toContain(COMPANY_NUMBER_TOO_LONG);
    });

    it("should create an error message when company number is too long", async () => {
        const response = await request(app)
            .post(COMPANY_REQUIRED_COMPANY_NUMBER)
            .set("Accept", "application/json")
            .set("Referer", "/")
            .set("Cookie", [`${COOKIE_NAME}=123`])
            .send({ companyNumber: "000064000" });

        expect(response.status).toEqual(200);
        expect(response).not.toBeUndefined();
        expect(response.text).not.toContain(NO_COMPANY_NUMBER_SUPPLIED);
        expect(response.text).not.toContain(INVALID_COMPANY_NUMBER);
        expect(response.text).toContain(COMPANY_NUMBER_TOO_LONG);
    });

    it("should create an error message when company is not found", async () => {
        mockCompanyProfile.mockImplementation(() => {
            throw new PromiseError(
                null,
                COMPANY_NOT_FOUND,
                404);
        });

        const response = await request(app)
            .post(COMPANY_REQUIRED_COMPANY_NUMBER)
            .set("Accept", "application/json")
            .set("Referer", "/")
            .set("Cookie", [`${COOKIE_NAME}=123`])
            .send({ companyNumber: "00012345" });

        expect(response.status).toEqual(200);
        expect(response).not.toBeUndefined();
        expect(response.text).not.toContain(NO_COMPANY_NUMBER_SUPPLIED);
        expect(response.text).not.toContain(INVALID_COMPANY_NUMBER);
        expect(response.text).not.toContain(COMPANY_NUMBER_TOO_LONG);
        expect(response.text).toContain(COMPANY_NOT_FOUND);
    });

    it("should return the error page when company search fails", async () => {
        mockCompanyProfile.mockImplementation(() => {
            throw new PromiseError(
                null,
                "Cannot find company profile",
                500);
        });

        const response = await request(app)
            .post(COMPANY_REQUIRED_COMPANY_NUMBER)
            .set("Accept", "application/json")
            .set("Referer", "/")
            .set("Cookie", [`${COOKIE_NAME}=123`])
            .send({ companyNumber: "00012345" });

        expect(response.status).toEqual(500);
        expect(response).not.toBeUndefined();
        expect(response.text).not.toContain(NO_COMPANY_NUMBER_SUPPLIED);
        expect(response.text).not.toContain(INVALID_COMPANY_NUMBER);
        expect(response.text).not.toContain(COMPANY_NUMBER_TOO_LONG);
        expect(response.text).not.toContain(COMPANY_NOT_FOUND);
        expect(response.text).toContain(ERROR_PAGE);
    });

    it("should redirect to the check company details screen when company is found", async () => {
        mockCompanyProfile.mockResolvedValue(getDummyCompanyProfile(true, true, true));

        const response = await request(app)
            .post(COMPANY_REQUIRED_COMPANY_NUMBER)
            .set("Accept", "application/json")
            .set("Referer", "/")
            .set("Cookie", [`${COOKIE_NAME}=123`])
            .send({ companyNumber: COMPANY_NUMBER });

        expect(response.header.location).toEqual(COMPANY_REQUIRED_CHECK_COMPANY);
        expect(response.status).toEqual(302);
        expect(mockCompanyProfile).toHaveBeenCalledWith(COMPANY_NUMBER, ACCESS_TOKEN);
        expect(updatePromiseToFileSessionValue).toHaveBeenCalledTimes(1);
        expect(updatePromiseToFileSessionValue).toHaveBeenCalledWith(expect.any(Session),
            COMPANY_PROFILE, getDummyCompanyProfile(true, true, true));
    });

    it("should not throw invalid error for company with two letter prefix", async () => {
        const response = await request(app)
            .post(COMPANY_REQUIRED_COMPANY_NUMBER)
            .set("Accept", "application/json")
            .set("Referer", "/")
            .set("Cookie", [`${COOKIE_NAME}=123`])
            .send({ companyNumber: "AB012345" });

        expect(response.status).toEqual(302);
        expect(response).not.toBeUndefined();
        expect(response.text).not.toContain(NO_COMPANY_NUMBER_SUPPLIED);
        expect(response.text).not.toContain(INVALID_COMPANY_NUMBER);
        expect(response.text).not.toContain(COMPANY_NUMBER_TOO_LONG);
    });

    it("should not throw invalid error for company with one letter prefix", async () => {
        const response = await request(app)
            .post(COMPANY_REQUIRED_COMPANY_NUMBER)
            .set("Accept", "application/json")
            .set("Referer", "/")
            .set("Cookie", [`${COOKIE_NAME}=123`])
            .send({ companyNumber: "A0123456" });

        expect(response.status).toEqual(302);
        expect(response).not.toBeUndefined();
        expect(response.text).not.toContain(NO_COMPANY_NUMBER_SUPPLIED);
        expect(response.text).not.toContain(INVALID_COMPANY_NUMBER);
        expect(response.text).not.toContain(COMPANY_NUMBER_TOO_LONG);
    });

    it("should pad company details for a valid abbreviated company number", async () => {
        mockCompanyProfile.mockResolvedValue(getDummyCompanyProfile(true, true, true));

        const response = await request(app)
            .post(COMPANY_REQUIRED_COMPANY_NUMBER)
            .set("Accept", "application/json")
            .set("Referer", "/")
            .set("Cookie", [`${COOKIE_NAME}=123`])
            .send({ companyNumber: "6400" });

        expect(response.header.location).toEqual(COMPANY_REQUIRED_CHECK_COMPANY);
        expect(response.status).toEqual(302);
        expect(mockCompanyProfile).toHaveBeenCalledWith(COMPANY_NUMBER, ACCESS_TOKEN);
    });

    it("should pad company details for a valid abbreviated company number - single letter prefix", async () => {
        mockCompanyProfile.mockResolvedValue(getDummyCompanyProfile(true, true, true));

        const response = await request(app)
            .post(COMPANY_REQUIRED_COMPANY_NUMBER)
            .set("Accept", "application/json")
            .set("Referer", "/")
            .set("Cookie", [`${COOKIE_NAME}=123`])
            .send({ companyNumber: "A123" });

        expect(response.header.location).toEqual(COMPANY_REQUIRED_CHECK_COMPANY);
        expect(response.status).toEqual(302);
        expect(mockCompanyProfile).toHaveBeenCalledWith("A0000123", ACCESS_TOKEN);
    });

    it("should pad company details for a valid abbreviated company number - double letter prefix", async () => {
        mockCompanyProfile.mockResolvedValue(getDummyCompanyProfile(true, true, true));

        const response = await request(app)
            .post(COMPANY_REQUIRED_COMPANY_NUMBER)
            .set("Accept", "application/json")
            .set("Referer", "/")
            .set("Cookie", [`${COOKIE_NAME}=123`])
            .send({ companyNumber: "AA123" });

        expect(response.header.location).toEqual(COMPANY_REQUIRED_CHECK_COMPANY);
        expect(response.status).toEqual(302);
        expect(mockCompanyProfile).toHaveBeenCalledWith("AA000123", ACCESS_TOKEN);
    });

});
