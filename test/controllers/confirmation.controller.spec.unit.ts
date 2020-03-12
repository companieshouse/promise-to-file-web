import * as request from "supertest";
import app from "../../src/app";
import { callPromiseToFileAPI } from "../../src/client/apiclient";
import activeFeature from "../../src/feature.flag";
import { PROMISE_TO_FILE } from "../../src/model/page.urls";
import { COOKIE_NAME } from "../../src/properties";
import { loadSession } from "../../src/services/redis.service";
import { getPromiseToFileSessionValue } from "../../src/services/session.service";
import { getDummyCompanyProfile, loadCompanyAuthenticatedSession } from "../mock.utils";

jest.mock("../../src/session/store/redis.store", () => import("../mocks/redis.store.mock.factory"));
jest.mock("../../src/services/redis.service");
jest.mock("../../src/client/apiclient");
jest.mock("../../src/services/session.service");
jest.mock("../../src/feature.flag");

const COMPANY_NUMBER: string = "00006400";
const COMPANY_NAME: string = "THE GIRLS DAY SCHOOL TRUST";
const EMAIL: string = "test@demo.ch.gov.uk";
const PAGE_TITLE: string = "Confirmation page";
const URL: string = PROMISE_TO_FILE + "/company/" + COMPANY_NUMBER + "/confirmation";
const ERROR_PAGE: string = "Sorry, there is a problem with the service";
const SCOTLAND: string = "scotland";
const NORTHERN_IRELAND: string = "northern-ireland";

describe("Company no longer required confirmation screen tests", () => {

  const mockCacheService = loadSession as jest.Mock;
  const mockPTFSession =  getPromiseToFileSessionValue as jest.Mock;
  const mockActiveFeature = activeFeature as jest.Mock;
  const mockCallProcessorApi = callPromiseToFileAPI as jest.Mock;

  it("should render the confirmation no longer required page", async () => {
    mockCacheService.mockClear();
    mockPTFSession.mockClear();
    mockCallProcessorApi.mockClear();
    loadCompanyAuthenticatedSession(mockCacheService, COMPANY_NUMBER, EMAIL);
    mockPTFSession.mockImplementationOnce(() => getDummyCompanyProfile(true, true));
    mockPTFSession.mockImplementationOnce(() => false);

    mockCallProcessorApi.prototype.constructor.mockImplementationOnce(() => Promise.resolve((
      {
        data: {},
      } )));

    const resp = await request(app)
      .get(URL)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(mockCallProcessorApi).toBeCalled();

    expect(resp.status).toEqual(200);
    expect(resp.text).toContain(COMPANY_NAME);
    expect(resp.text).not.toContain(COMPANY_NUMBER);
    expect(resp.text).toContain(EMAIL);
    expect(resp.text).toContain(PAGE_TITLE);
  });

  it("should render the confirmation stub page (england-wales)", async () => {
    mockCacheService.mockClear();
    mockPTFSession.mockClear();
    mockCallProcessorApi.mockClear();
    loadCompanyAuthenticatedSession(mockCacheService, COMPANY_NUMBER, EMAIL);
    const dummyProfile = getDummyCompanyProfile(true, true);
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
    const dummyProfile = getDummyCompanyProfile(true, true);
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
    const dummyProfile = getDummyCompanyProfile(true, true);
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

  it("should render the confirmation still required page when feature flag is true", async () => {

    mockCacheService.mockClear();
    mockPTFSession.mockClear();
    mockActiveFeature.mockClear();
    mockCallProcessorApi.mockClear();
    loadCompanyAuthenticatedSession(mockCacheService, COMPANY_NUMBER, EMAIL);
    const dummyProfile = getDummyCompanyProfile(true, true);
    mockPTFSession.mockImplementationOnce(() => dummyProfile);
    mockPTFSession.mockImplementationOnce(() => true);
    mockActiveFeature.mockImplementationOnce(() => true);

    mockCallProcessorApi.prototype.constructor.mockImplementationOnce(() => Promise.resolve((
      {
        data: {
          new_filing_deadline: "2028-03-10",
        },
      } )));

    const resp = await request(app)
      .get(URL)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(mockCallProcessorApi).toBeCalled();

    expect(resp.status).toEqual(200);
    expect(resp.text).toContain(COMPANY_NAME);
    expect(resp.text).toContain(COMPANY_NUMBER);
    expect(resp.text).toContain("will be kept on the register");
    expect(resp.text).not.toContain("CF14 3UZ");
    expect(resp.text).toContain(PAGE_TITLE);
    expect(resp.text).toContain("filed by 10 March 2028");
  });

  it("should return the error page if email is missing from session", async () => {
    mockCacheService.mockClear();
    mockPTFSession.mockClear();
    mockCallProcessorApi.mockClear();
    loadCompanyAuthenticatedSession(mockCacheService, COMPANY_NUMBER);
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
  });

  it("should return the error page if company profile is missing from session", async () => {
    mockCacheService.mockClear();
    mockPTFSession.mockClear();
    mockCallProcessorApi.mockClear();
    loadCompanyAuthenticatedSession(mockCacheService, COMPANY_NUMBER, EMAIL);
    mockPTFSession.mockImplementationOnce(() => null);
    mockPTFSession.mockImplementationOnce(() => false);
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
  });
});
