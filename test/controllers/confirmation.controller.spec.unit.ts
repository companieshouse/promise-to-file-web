import * as request from "supertest";
import app from "../../src/app";
import { callPromiseToFileAPI } from "../../src/client/apiclient";
import activeFeature from "../../src/feature.flag";
import logger from "../../src/logger";
import { COMPANY_REQUIRED } from "../../src/model/page.urls";
import { COOKIE_NAME } from "../../src/properties";
import { loadSession } from "../../src/services/redis.service";
import { getPromiseToFileSessionValue } from "../../src/services/session.service";
import { getDummyCompanyProfile, loadCompanyAuthenticatedSession } from "../mock.utils";
import { expect, jest } from "@jest/globals";
import PromiseError from "../../src/utils/error";

jest.mock("../../src/session/store/redis.store", () => import("../mocks/redis.store.mock.factory"));
jest.mock("../../src/services/redis.service");
jest.mock("../../src/client/apiclient");
jest.mock("../../src/services/session.service");
jest.mock("../../src/feature.flag");
jest.mock("../../src/logger");
jest.mock("ioredis", () => require("ioredis-mock"));

const COMPANY_NUMBER: string = "00006400";
const COMPANY_NAME: string = "THE GIRLS DAY SCHOOL TRUST";
const EMAIL: string = "test@demo.ch.gov.uk";
const PAGE_TITLE: string = "Confirmation page";
const NOT_ELIGIBLE_PAGE_TITLE: string = "You cannot use this service";
const URL: string = COMPANY_REQUIRED + "/company/" + COMPANY_NUMBER + "/confirmation";
const ERROR_PAGE: string = "Sorry, there is a problem with the service";
const SCOTLAND: string = "scotland";
const NORTHERN_IRELAND: string = "northern-ireland";

const mockCacheService = loadSession as jest.Mock;
const mockPTFSession = getPromiseToFileSessionValue as jest.Mock;
const mockActiveFeature = activeFeature as jest.Mock;
const mockCallProcessorApi = callPromiseToFileAPI as jest.Mock;
const mockLoggerError = logger.error as jest.Mock;

describe("Company no longer required confirmation screen tests", () => {

    it("should render the confirmation no longer required page (AA overdue)", async () => {
        mockCacheService.mockClear();
        mockPTFSession.mockClear();
        mockCallProcessorApi.mockClear();
        loadCompanyAuthenticatedSession(mockCacheService, COMPANY_NUMBER, EMAIL);
        mockPTFSession.mockImplementationOnce(() => getDummyCompanyProfile(true, false, true));
        mockPTFSession.mockImplementationOnce(() => false);

        mockCallProcessorApi.prototype.constructor.mockImplementationOnce(() => Promise.resolve((
            {
                data: {}
            })));

        const resp = await request(app)
            .get(URL)
            .set("Referer", "/")
            .set("Cookie", [`${COOKIE_NAME}=123`]);

        expect(mockCallProcessorApi).toBeCalled();

        expect(resp.status).toEqual(200);
        expect(resp.text).toContain(COMPANY_NAME);
        expect(resp.text).toContain(COMPANY_NUMBER);
        expect(resp.text).toContain(EMAIL);
        expect(resp.text).toContain("is no longer required");
        expect(resp.text).toContain("we will no longer pursue the overdue accounts.");
        expect(resp.text).not.toContain("we will no longer pursue the overdue confirmation statement.");
        expect(resp.text).not.toContain("we will no longer pursue the overdue accounts and confirmation statement.");
        expect(resp.text).toContain(PAGE_TITLE);
    });

    it("should render the confirmation no longer required page (CS overdue)", async () => {
        mockCacheService.mockClear();
        mockPTFSession.mockClear();
        mockCallProcessorApi.mockClear();
        loadCompanyAuthenticatedSession(mockCacheService, COMPANY_NUMBER, EMAIL);
        mockPTFSession.mockImplementationOnce(() => getDummyCompanyProfile(false, true, true));
        mockPTFSession.mockImplementationOnce(() => false);

        mockCallProcessorApi.prototype.constructor.mockImplementationOnce(() => Promise.resolve((
            {
                data: {}
            })));

        const resp = await request(app)
            .get(URL)
            .set("Referer", "/")
            .set("Cookie", [`${COOKIE_NAME}=123`]);

        expect(mockCallProcessorApi).toBeCalled();

        expect(resp.status).toEqual(200);
        expect(resp.text).toContain(COMPANY_NAME);
        expect(resp.text).toContain(COMPANY_NUMBER);
        expect(resp.text).toContain(EMAIL);
        expect(resp.text).toContain("is no longer required");
        expect(resp.text).not.toContain("we will no longer pursue the overdue accounts.");
        expect(resp.text).toContain("we will no longer pursue the overdue confirmation statement.");
        expect(resp.text).not.toContain("we will no longer pursue the overdue accounts and confirmation statement.");
        expect(resp.text).toContain(PAGE_TITLE);
    });

    it("should render the confirmation no longer required page (AA and CS overdue)", async () => {
        mockCacheService.mockClear();
        mockPTFSession.mockClear();
        mockCallProcessorApi.mockClear();
        loadCompanyAuthenticatedSession(mockCacheService, COMPANY_NUMBER, EMAIL);
        mockPTFSession.mockImplementationOnce(() => getDummyCompanyProfile(true, true, true));
        mockPTFSession.mockImplementationOnce(() => false);

        mockCallProcessorApi.prototype.constructor.mockImplementationOnce(() => Promise.resolve((
            {
                data: {}
            })));

        const resp = await request(app)
            .get(URL)
            .set("Referer", "/")
            .set("Cookie", [`${COOKIE_NAME}=123`]);

        expect(mockCallProcessorApi).toBeCalled();

        expect(resp.status).toEqual(200);
        expect(resp.text).toContain(COMPANY_NAME);
        expect(resp.text).toContain(COMPANY_NUMBER);
        expect(resp.text).toContain(EMAIL);
        expect(resp.text).toContain("is no longer required");
        expect(resp.text).not.toContain("we will no longer pursue the overdue accounts.");
        expect(resp.text).not.toContain("we will no longer pursue the overdue confirmation statement.");
        expect(resp.text).toContain("we will no longer pursue the overdue accounts and confirmation statement.");
        expect(resp.text).toContain(PAGE_TITLE);
    });
});

describe("Confirmation stub screen tests", () => {

    it("should render the confirmation stub page (england-wales)", async () => {
        mockCacheService.mockClear();
        mockPTFSession.mockClear();
        mockCallProcessorApi.mockClear();
        loadCompanyAuthenticatedSession(mockCacheService, COMPANY_NUMBER, EMAIL);
        const dummyProfile = getDummyCompanyProfile(true, true, true);
        mockPTFSession.mockImplementationOnce(() => dummyProfile);
        mockPTFSession.mockImplementationOnce(() => true);
        const resp = await request(app)
            .get(URL)
            .set("Referer", "/")
            .set("Cookie", [`${COOKIE_NAME}=123`]);

        expect(mockCallProcessorApi).toBeCalledTimes(0);

        expect(resp.status).toEqual(200);
        expect(resp.text).toContain(COMPANY_NAME);
        expect(resp.text).not.toContain(COMPANY_NUMBER);
        expect(resp.text).toContain("What you need to do");
        expect(resp.text).toContain("CF14 3UZ");
        expect(resp.text).toContain(PAGE_TITLE);
    });

    it("should render the confirmation stub page (scotland)", async () => {
        mockCacheService.mockClear();
        mockPTFSession.mockClear();
        mockCallProcessorApi.mockClear();
        loadCompanyAuthenticatedSession(mockCacheService, COMPANY_NUMBER, EMAIL);
        const dummyProfile = getDummyCompanyProfile(true, true, true);
        dummyProfile.jurisdiction = SCOTLAND;
        mockPTFSession.mockImplementationOnce(() => dummyProfile);
        mockPTFSession.mockImplementationOnce(() => true);
        const resp = await request(app)
            .get(URL)
            .set("Referer", "/")
            .set("Cookie", [`${COOKIE_NAME}=123`]);

        expect(mockCallProcessorApi).toBeCalledTimes(0);

        expect(resp.status).toEqual(200);
        expect(resp.text).toContain(COMPANY_NAME);
        expect(resp.text).not.toContain(COMPANY_NUMBER);
        expect(resp.text).toContain("What you need to do");
        expect(resp.text).toContain("EH3 9FF");
        expect(resp.text).toContain(PAGE_TITLE);
    });

    it("should render the confirmation stub page (northern-ireland)", async () => {
        mockCacheService.mockClear();
        mockPTFSession.mockClear();
        mockCallProcessorApi.mockClear();
        loadCompanyAuthenticatedSession(mockCacheService, COMPANY_NUMBER, EMAIL);
        const dummyProfile = getDummyCompanyProfile(true, true, true);
        dummyProfile.jurisdiction = NORTHERN_IRELAND;
        mockPTFSession.mockImplementationOnce(() => dummyProfile);
        mockPTFSession.mockImplementationOnce(() => true);
        const resp = await request(app)
            .get(URL)
            .set("Referer", "/")
            .set("Cookie", [`${COOKIE_NAME}=123`]);

        expect(mockCallProcessorApi).toBeCalledTimes(0);

        expect(resp.status).toEqual(200);
        expect(resp.text).toContain(COMPANY_NAME);
        expect(resp.text).not.toContain(COMPANY_NUMBER);
        expect(resp.text).toContain("What you need to do");
        expect(resp.text).toContain("BT2 8BG");
        expect(resp.text).toContain(PAGE_TITLE);
    });
});

describe("Company still required confirmation screen tests", () => {

    it("should render the confirmation still required page when feature flag is true", async () => {

        mockCacheService.mockClear();
        mockPTFSession.mockClear();
        mockCallProcessorApi.mockClear();
        loadCompanyAuthenticatedSession(mockCacheService, COMPANY_NUMBER, EMAIL);
        const dummyProfile = getDummyCompanyProfile(true, true, true);
        mockPTFSession.mockImplementationOnce(() => dummyProfile);
        mockPTFSession.mockImplementationOnce(() => true);
        setMockFeatureFlags();

        mockCallProcessorApi.prototype.constructor.mockImplementationOnce(() => Promise.resolve((
            {
                data: {
                    filing_due_on: "2028-03-10"
                }
            })));

        const resp = await request(app)
            .get(URL)
            .set("Referer", "/")
            .set("Cookie", [`${COOKIE_NAME}=123`]);

        expect(mockCallProcessorApi).toBeCalled();

        expect(resp.status).toEqual(200);
        expect(resp.text).toContain(COMPANY_NAME);
        expect(resp.text).toContain(COMPANY_NUMBER);
        expect(resp.text).toContain("must file its accounts and confirmation statement to stay");
        expect(resp.text).toContain("will be kept on the register");
        expect(resp.text).not.toContain("CF14 3UZ");
        expect(resp.text).toContain(PAGE_TITLE);
        expect(resp.text).toContain("filed by 10 March 2028");
    });

    it("should report the correct overdue filings if only accounts are overdue", async () => {

        mockCacheService.mockClear();
        mockPTFSession.mockClear();
        mockCallProcessorApi.mockClear();
        loadCompanyAuthenticatedSession(mockCacheService, COMPANY_NUMBER, EMAIL);
        const dummyProfile = getDummyCompanyProfile(true, true, true);

        dummyProfile.isConfirmationStatementOverdue = false;

        mockPTFSession.mockImplementationOnce(() => dummyProfile);
        mockPTFSession.mockImplementationOnce(() => true);
        setMockFeatureFlags();

        mockCallProcessorApi.prototype.constructor.mockImplementationOnce(() => Promise.resolve((
            {
                data: {
                    filing_due_on: "2028-03-10"
                }
            })));

        const resp = await request(app)
            .get(URL)
            .set("Referer", "/")
            .set("Cookie", [`${COOKIE_NAME}=123`]);

        expect(mockCallProcessorApi).toBeCalled();

        expect(resp.status).toEqual(200);
        expect(resp.text).toContain("must file its accounts to stay");
    });

    it("should report the correct overdue filings if only confirmation statement is overdue", async () => {

        mockCacheService.mockClear();
        mockPTFSession.mockClear();
        mockCallProcessorApi.mockClear();
        loadCompanyAuthenticatedSession(mockCacheService, COMPANY_NUMBER, EMAIL);
        const dummyProfile = getDummyCompanyProfile(true, true, true);

        dummyProfile.isAccountsOverdue = false;

        mockPTFSession.mockImplementationOnce(() => dummyProfile);
        mockPTFSession.mockImplementationOnce(() => true);
        setMockFeatureFlags();

        mockCallProcessorApi.prototype.constructor.mockImplementationOnce(() => Promise.resolve((
            {
                data: {
                    filing_due_on: "2028-03-10"
                }
            })));

        const resp = await request(app)
            .get(URL)
            .set("Referer", "/")
            .set("Cookie", [`${COOKIE_NAME}=123`]);

        expect(mockCallProcessorApi).toBeCalled();

        expect(resp.status).toEqual(200);
        expect(resp.text).toContain("must file its confirmation statement to stay");
    });

    it("should render the not eligible page (no open compliance case) when reason code is NO_OPEN_COMPLIANCE_CASE",
        async () => {

            mockCacheService.mockClear();
            mockPTFSession.mockClear();
            mockCallProcessorApi.mockRestore();
            loadCompanyAuthenticatedSession(mockCacheService, COMPANY_NUMBER, EMAIL);
            const dummyProfile = getDummyCompanyProfile(true, true, true);
            mockPTFSession.mockImplementationOnce(() => dummyProfile);
            mockPTFSession.mockImplementationOnce(() => true);
            setMockFeatureFlags();

            mockCallProcessorApi.prototype.constructor.mockImplementation(() => Promise.resolve((
                {
                    data: {
                        reason_code: "NO_OPEN_COMPLIANCE_CASE"
                    },
                    status: 400
                })));

            const resp = await request(app)
                .get(URL)
                .set("Referer", "/")
                .set("Cookie", [`${COOKIE_NAME}=123`]);

            expect(mockCallProcessorApi).toBeCalled();

            expect(resp.status).toEqual(200);
            expect(resp.text).toContain(
                "The accounts and confirmation statement for THE GIRLS DAY SCHOOL TRUST have been filed");
            expect(resp.text).not.toContain("The company THE GIRLS DAY SCHOOL TRUST has filed documents late in the past.");
            expect(resp.text).not.toContain("We've already been told that THE GIRLS DAY SCHOOL TRUST is still required.");
            expect(resp.text).not.toContain("The company THE GIRLS DAY SCHOOL TRUST has no appointed directors.");
            expect(resp.text).not.toContain("The company THE GIRLS DAY SCHOOL TRUST is already late filing their accounts");
            expect(resp.text).toContain(NOT_ELIGIBLE_PAGE_TITLE);
        });

    it("should render the not eligible page (persistently late) when reason code is PERSISTENTLY_LATE", async () => {

        mockCacheService.mockClear();
        mockPTFSession.mockClear();
        mockCallProcessorApi.mockRestore();
        loadCompanyAuthenticatedSession(mockCacheService, COMPANY_NUMBER, EMAIL);
        const dummyProfile = getDummyCompanyProfile(true, true, true);
        mockPTFSession.mockImplementationOnce(() => dummyProfile);
        mockPTFSession.mockImplementationOnce(() => true);
        setMockFeatureFlags();

        mockCallProcessorApi.prototype.constructor.mockImplementation(() => Promise.resolve((
            {
                data: {
                    reason_code: "PERSISTENTLY_LATE"
                },
                status: 400
            })));

        const resp = await request(app)
            .get(URL)
            .set("Referer", "/")
            .set("Cookie", [`${COOKIE_NAME}=123`]);

        expect(mockCallProcessorApi).toBeCalled();

        expect(resp.status).toEqual(200);
        expect(resp.text).not.toContain("The accounts and confirmation statement for THE GIRLS DAY SCHOOL TRUST have been filed");
        expect(resp.text).toContain("The company THE GIRLS DAY SCHOOL TRUST has filed documents late in the past.");
        expect(resp.text).not.toContain("We've already been told that THE GIRLS DAY SCHOOL TRUST is still required.");
        expect(resp.text).not.toContain("The company THE GIRLS DAY SCHOOL TRUST has no appointed directors.");
        expect(resp.text).not.toContain("The company THE GIRLS DAY SCHOOL TRUST is already late filing their accounts");
        expect(resp.text).toContain(NOT_ELIGIBLE_PAGE_TITLE);
    });

    it("should render the not eligible page (existing promise to file) when reason code is EXISTING_PTF",
        async () => {

            mockCacheService.mockClear();
            mockPTFSession.mockClear();
            mockCallProcessorApi.mockRestore();
            loadCompanyAuthenticatedSession(mockCacheService, COMPANY_NUMBER, EMAIL);
            const dummyProfile = getDummyCompanyProfile(true, true, true);
            mockPTFSession.mockImplementationOnce(() => dummyProfile);
            mockPTFSession.mockImplementationOnce(() => true);
            setMockFeatureFlags();

            mockCallProcessorApi.prototype.constructor.mockImplementation(() => Promise.resolve((
                {
                    data: {
                        reason_code: "EXISTING_PTF"
                    },
                    status: 400
                })));

            const resp = await request(app)
                .get(URL)
                .set("Referer", "/")
                .set("Cookie", [`${COOKIE_NAME}=123`]);

            expect(mockCallProcessorApi).toBeCalled();

            expect(resp.status).toEqual(200);
            expect(resp.text).not.toContain("The accounts and confirmation statement for THE GIRLS DAY SCHOOL TRUST have been filed");
            expect(resp.text).not.toContain("The company THE GIRLS DAY SCHOOL TRUST has filed documents late in the past.");
            expect(resp.text).toContain("We've already been told that THE GIRLS DAY SCHOOL TRUST is still required.");
            expect(resp.text).not.toContain("The company THE GIRLS DAY SCHOOL TRUST has no appointed directors.");
            expect(resp.text).not.toContain("The company THE GIRLS DAY SCHOOL TRUST is already late filing their accounts");
            expect(resp.text).toContain(NOT_ELIGIBLE_PAGE_TITLE);
        });

    it("should render the not eligible page (no appointed directors) when reason code is NO_DIRECTORS",
        async () => {

            mockCacheService.mockClear();
            mockPTFSession.mockClear();
            mockCallProcessorApi.mockRestore();
            loadCompanyAuthenticatedSession(mockCacheService, COMPANY_NUMBER, EMAIL);
            const dummyProfile = getDummyCompanyProfile(true, true, true);
            mockPTFSession.mockImplementationOnce(() => dummyProfile);
            mockPTFSession.mockImplementationOnce(() => true);
            setMockFeatureFlags();

            mockCallProcessorApi.prototype.constructor.mockImplementation(() => Promise.resolve((
                {
                    data: {
                        reason_code: "NO_DIRECTORS"
                    },
                    status: 400
                })));

            const resp = await request(app)
                .get(URL)
                .set("Referer", "/")
                .set("Cookie", [`${COOKIE_NAME}=123`]);

            expect(mockCallProcessorApi).toBeCalled();

            expect(resp.status).toEqual(200);
            expect(resp.text).not.toContain("The accounts and confirmation statement for THE GIRLS DAY SCHOOL TRUST have been filed");
            expect(resp.text).not.toContain("The company THE GIRLS DAY SCHOOL TRUST has filed documents late in the past.");
            expect(resp.text).not.toContain("We've already been told that THE GIRLS DAY SCHOOL TRUST is still required.");
            expect(resp.text).toContain("The company THE GIRLS DAY SCHOOL TRUST has no appointed directors.");
            expect(resp.text).not.toContain("The company THE GIRLS DAY SCHOOL TRUST is already late filing their accounts");
            expect(resp.text).toContain(NOT_ELIGIBLE_PAGE_TITLE);
        });

    it("should render the not eligible page (company already in prosecution) when reason code is COMPANY_ALREADY_IN_PROSECUTION (AA overdue)",
        async () => {

            mockCacheService.mockClear();
            mockPTFSession.mockClear();
            mockActiveFeature.mockClear();
            mockCallProcessorApi.mockRestore();
            loadCompanyAuthenticatedSession(mockCacheService, COMPANY_NUMBER, EMAIL);
            const dummyProfile = getDummyCompanyProfile(true, false, true);
            mockPTFSession.mockImplementationOnce(() => dummyProfile);
            mockPTFSession.mockImplementationOnce(() => true);
            setMockFeatureFlags();

            mockCallProcessorApi.prototype.constructor.mockImplementation(() => Promise.resolve((
                {
                    data: {
                        reason_code: "COMPANY_ALREADY_IN_PROSECUTION"
                    },
                    status: 400
                })));

            const resp = await request(app)
                .get(URL)
                .set("Referer", "/")
                .set("Cookie", [`${COOKIE_NAME}=123`]);

            expect(mockCallProcessorApi).toBeCalled();

            expect(resp.status).toEqual(200);
            expect(resp.text).not.toContain(
                "The accounts and confirmation statement for THE GIRLS DAY SCHOOL TRUST have been filed");
            expect(resp.text).not.toContain("The company THE GIRLS DAY SCHOOL TRUST has filed documents late in the past.");
            expect(resp.text).not.toContain("We've already been told that THE GIRLS DAY SCHOOL TRUST is still required.");
            expect(resp.text).not.toContain("The company THE GIRLS DAY SCHOOL TRUST has no appointed directors.");
            expect(resp.text).toContain("The company THE GIRLS DAY SCHOOL TRUST is already late filing");
            expect(resp.text).toContain("The penalty will increase over time until the accounts are filed");
            expect(resp.text).toContain(NOT_ELIGIBLE_PAGE_TITLE);
        });

    it("should render the not eligible page (company already in prosecution) when reason code is COMPANY_ALREADY_IN_PROSECUTION (CS overdue)",
        async () => {

            mockCacheService.mockClear();
            mockPTFSession.mockClear();
            mockActiveFeature.mockClear();
            mockCallProcessorApi.mockRestore();
            loadCompanyAuthenticatedSession(mockCacheService, COMPANY_NUMBER, EMAIL);
            const dummyProfile = getDummyCompanyProfile(false, true, true);
            mockPTFSession.mockImplementationOnce(() => dummyProfile);
            mockPTFSession.mockImplementationOnce(() => true);
            setMockFeatureFlags();

            mockCallProcessorApi.prototype.constructor.mockImplementation(() => Promise.resolve((
                {
                    data: {
                        reason_code: "COMPANY_ALREADY_IN_PROSECUTION"
                    },
                    status: 400
                })));

            const resp = await request(app)
                .get(URL)
                .set("Referer", "/")
                .set("Cookie", [`${COOKIE_NAME}=123`]);

            expect(mockCallProcessorApi).toBeCalled();

            expect(resp.status).toEqual(200);
            expect(resp.text).not.toContain(
                "The accounts and confirmation statement for THE GIRLS DAY SCHOOL TRUST have been filed");
            expect(resp.text).not.toContain("The company THE GIRLS DAY SCHOOL TRUST has filed documents late in the past.");
            expect(resp.text).not.toContain("We've already been told that THE GIRLS DAY SCHOOL TRUST is still required.");
            expect(resp.text).not.toContain("The company THE GIRLS DAY SCHOOL TRUST has no appointed directors.");
            expect(resp.text).toContain("The company THE GIRLS DAY SCHOOL TRUST is already late filing");
            expect(resp.text).not.toContain("The penalty will increase over time until the accounts are filed");
            expect(resp.text).toContain(NOT_ELIGIBLE_PAGE_TITLE);
        });

    it("should return the error page if email is missing from session", async () => {
        mockLoggerError.mockClear();
        mockCacheService.mockClear();
        mockPTFSession.mockClear();
        mockCallProcessorApi.mockClear();
        loadCompanyAuthenticatedSession(mockCacheService, COMPANY_NUMBER);

        const dummyProfile = getDummyCompanyProfile(true, true, true);
        mockPTFSession.mockImplementationOnce(() => dummyProfile);
        mockPTFSession.mockImplementationOnce(() => true);
        setMockFeatureFlags();

        const resp = await request(app)
            .get(URL)
            .set("Referer", "/")
            .set("Cookie", [`${COOKIE_NAME}=123`]);

        expect(mockCallProcessorApi).toBeCalledTimes(0);

        expect(resp.status).toEqual(500);
        expect(resp.text).not.toContain(EMAIL);
        expect(resp.text).not.toContain(COMPANY_NAME);
        expect(resp.text).not.toContain(COMPANY_NUMBER);
        expect(resp.text).not.toContain(PAGE_TITLE);
        expect(resp.text).toContain(ERROR_PAGE);

        expect(mockLoggerError).toBeCalledWith(expect.stringContaining("User Email"));
    });

    it("should render the error page when API returns 'undefined' for a new filing deadline date", async () => {

        mockLoggerError.mockReset();
        mockCacheService.mockClear();
        mockPTFSession.mockClear();
        mockCallProcessorApi.mockClear();
        loadCompanyAuthenticatedSession(mockCacheService, COMPANY_NUMBER, EMAIL);
        const dummyProfile = getDummyCompanyProfile(true, true, true);
        mockPTFSession.mockImplementationOnce(() => dummyProfile);
        mockPTFSession.mockImplementationOnce(() => true);
        setMockFeatureFlags();

        mockCallProcessorApi.prototype.constructor.mockImplementationOnce(() => Promise.resolve((
            {
                data: {
                    filing_due_on: undefined
                }
            })));

        const resp = await request(app)
            .get(URL)
            .set("Referer", "/")
            .set("Cookie", [`${COOKIE_NAME}=123`]);

        expect(mockCallProcessorApi).toBeCalled();

        expect(resp.status).toEqual(500);
        expect(resp.text).not.toContain(EMAIL);
        expect(resp.text).not.toContain(COMPANY_NAME);
        expect(resp.text).not.toContain(COMPANY_NUMBER);
        expect(resp.text).not.toContain(PAGE_TITLE);
        expect(resp.text).not.toContain("will be kept on the register");
        expect(resp.text).not.toContain("filed by");
        expect(resp.text).toContain(ERROR_PAGE);

        expect(mockLoggerError).toBeCalledWith(expect.stringContaining("No new filing due date returned by the PTF API"));
    });

    it("should render the error page when API returns 'null' for a new filing deadline date", async () => {

        mockLoggerError.mockReset();
        mockCacheService.mockClear();
        mockPTFSession.mockClear();
        mockCallProcessorApi.mockClear();
        loadCompanyAuthenticatedSession(mockCacheService, COMPANY_NUMBER, EMAIL);
        const dummyProfile = getDummyCompanyProfile(true, true, true);
        mockPTFSession.mockImplementationOnce(() => dummyProfile);
        mockPTFSession.mockImplementationOnce(() => true);
        setMockFeatureFlags();

        mockCallProcessorApi.prototype.constructor.mockImplementationOnce(() => Promise.resolve((
            {
                data: {
                    filing_due_on: null
                }
            })));

        const resp = await request(app)
            .get(URL)
            .set("Referer", "/")
            .set("Cookie", [`${COOKIE_NAME}=123`]);

        expect(mockCallProcessorApi).toBeCalled();

        expect(resp.status).toEqual(500);
        expect(resp.text).not.toContain(EMAIL);
        expect(resp.text).not.toContain(COMPANY_NAME);
        expect(resp.text).not.toContain(COMPANY_NUMBER);
        expect(resp.text).not.toContain(PAGE_TITLE);
        expect(resp.text).not.toContain("will be kept on the register");
        expect(resp.text).not.toContain("filed by");
        expect(resp.text).toContain(ERROR_PAGE);

        expect(mockLoggerError).toBeCalledWith(expect.stringContaining("No new filing due date returned by the PTF API"));
    });

    it("should return the error page if company profile is missing from session", async () => {

        mockLoggerError.mockReset();
        mockCacheService.mockReset();
        mockPTFSession.mockReset();
        mockActiveFeature.mockReset();
        mockCallProcessorApi.mockReset();
        loadCompanyAuthenticatedSession(mockCacheService, COMPANY_NUMBER, EMAIL);
        mockPTFSession.mockImplementationOnce(() => null);
        mockPTFSession.mockImplementationOnce(() => false);

        mockActiveFeature.mockReturnValueOnce(false);

        const resp = await request(app)
            .get(URL)
            .set("Referer", "/")
            .set("Cookie", [`${COOKIE_NAME}=123`]);

        expect(mockCallProcessorApi).toBeCalledTimes(0);

        expect(resp.status).toEqual(500);
        expect(resp.text).not.toContain(EMAIL);
        expect(resp.text).not.toContain(COMPANY_NAME);
        expect(resp.text).not.toContain(COMPANY_NUMBER);
        expect(resp.text).not.toContain(PAGE_TITLE);
        expect(resp.text).toContain(ERROR_PAGE);

        expect(mockLoggerError).toBeCalledWith(expect.stringContaining("Company profile"));
    });

    it("should return the error page if no reason code is returned by API", async () => {

        mockLoggerError.mockReset();
        mockCacheService.mockReset();
        mockPTFSession.mockReset();
        mockCallProcessorApi.mockRestore();
        loadCompanyAuthenticatedSession(mockCacheService, COMPANY_NUMBER, EMAIL);
        const dummyProfile = getDummyCompanyProfile(true, true, true);
        mockPTFSession.mockImplementationOnce(() => dummyProfile);
        mockPTFSession.mockImplementationOnce(() => true);
        setMockFeatureFlags();

        mockCallProcessorApi.prototype.constructor.mockImplementation(() => Promise.resolve((
            {
                data: {},
                status: 400
            })));

        const resp = await request(app)
            .get(URL)
            .set("Referer", "/")
            .set("Cookie", [`${COOKIE_NAME}=123`]);

        expect(mockCallProcessorApi).toBeCalled();

        expect(resp.status).toEqual(500);
        expect(resp.text).not.toContain("THE GIRLS DAY SCHOOL TRUST");
        expect(resp.text).toContain(ERROR_PAGE);

        expect(mockLoggerError).toBeCalledWith(expect.stringContaining("No reason_code in api response"));
    });

    it("should return the error page if an error is returned by API", async () => {
        mockLoggerError.mockReset();
        mockCacheService.mockReset();
        mockPTFSession.mockReset();
        mockCallProcessorApi.mockRestore();
        loadCompanyAuthenticatedSession(mockCacheService, COMPANY_NUMBER, EMAIL);
        const dummyProfile = getDummyCompanyProfile(true, true, true);
        mockPTFSession.mockImplementationOnce(() => dummyProfile);
        mockPTFSession.mockImplementationOnce(() => true);
        setMockFeatureFlags();

        mockCallProcessorApi.prototype.constructor.mockImplementation(() => {
            throw new PromiseError(
                [],
                "Simulated error",
                500
            );
        });

        const resp = await request(app)
            .get(URL)
            .set("Referer", "/")
            .set("Cookie", [`${COOKIE_NAME}=123`]);

        expect(mockCallProcessorApi).toBeCalled();

        expect(resp.status).toEqual(500);
        expect(resp.text).not.toContain("THE GIRLS DAY SCHOOL TRUST");
        expect(resp.text).toContain(ERROR_PAGE);

        expect(mockLoggerError).toBeCalledWith(expect.stringContaining("Simulated error"));
    });
});

const setMockFeatureFlags = () => {
    mockActiveFeature.mockReset();
    mockActiveFeature
        .mockReturnValueOnce(false) // SHOW_SERVICE_UNAVAILABLE_PAGE
        .mockReturnValueOnce(true); // COMPANY_STILL_REQUIRED_FEATURE_FLAG
};
