import * as request from "supertest";
import app from "../../src/app";
import {getCompanyProfile} from "../../src/client/apiclient";
import {COOKIE_NAME} from "../../src/properties";
import * as pageURLs from "../../src/model/page.urls";
import {loadSession} from "../../src/services/redis.service";
import * as mockUtils from "../mock.utils";
import { getCompanyNumberInContext } from "../../src/services/session.service";

jest.mock("../../src/client/api.enumerations");
jest.mock("../../src/client/apiclient");
jest.mock("../../src/services/redis.service");
jest.mock("../../src/services/session.service");

const GENERIC_ERROR = "Sorry, there is a problem with the service";
const TITLE = "Sorry, there is a problem with the service - GOV.UK";

const mockCompanyProfile: jest.Mock = (<unknown> getCompanyProfile as jest.Mock<typeof getCompanyProfile>);
const mockCacheService = (<unknown> loadSession as jest.Mock<typeof loadSession>);
const mockGetCompanyInContext = (<unknown> getCompanyNumberInContext as jest.Mock<typeof getCompanyNumberInContext>);

beforeEach(() => {
  mockCompanyProfile.mockRestore();
  mockCacheService.mockRestore();
  mockUtils.loadMockSession(mockCacheService);
  mockGetCompanyInContext.mockReturnValueOnce(() => "00006400");
});

describe("check.company.controller tests", () => {
  it("should return a company profile if company number exists in session with no overdue message", async () => {
    mockCompanyProfile.mockResolvedValue(mockUtils.getDummyCompanyProfile(false, false, true));

    const mockPresent: Date = new Date("2020-01-11");
    mockPresent.setHours(0,0,0);
    jest.spyOn(Date, "now").mockReturnValue(mockPresent.getTime());

    const res = await request(app).get("/promise-to-file/check-company")
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(res.status).toEqual(200);
    expect(res.text).toContain(mockUtils.COMPANY_NAME);
    expect(res.text).toContain(mockUtils.COMPANY_NUMBER);
    expect(res.text).toContain(mockUtils.COMPANY_STATUS_ACTIVE);
    expect(res.text).toContain(mockUtils.COMPANY_TYPE);
    expect(res.text).toContain(mockUtils.COMPANY_INC_DATE);
    expect(res.text).not.toContain("Your accounts are overdue");
    expect(res.text).toContain(mockUtils.LINE_1);
    expect(res.text).toContain(mockUtils.LINE_2);
    expect(res.text).toContain(mockUtils.POST_CODE);
    expect(res.text).toContain(mockUtils.ACCOUNTS_NEXT_DUE_DATE);

    // TODO: Test these fields once sdk obtains this data from company profile api.
    // expect(res.text).toContain(mockUtils.CONFIRMATION_STATEMENT_DUE);
    // expect(res.text).toContain(mockUtils.PTF_REQUESTED);
  });

  it("should return a overdue message when flag false but date has passed", async () => {
    mockCompanyProfile.mockResolvedValue(mockUtils.getDummyCompanyProfile(false, false, true));

    const mockPresent: Date = new Date("2020-01-13");
    mockPresent.setHours(0,0,0);
    jest.spyOn(Date, "now").mockReturnValue(mockPresent.getTime());

    const res = await request(app).get("/promise-to-file/check-company")
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(res.status).toEqual(200);
    expect(res.text).toContain(mockUtils.COMPANY_NAME);
    expect(res.text).toContain(mockUtils.COMPANY_NUMBER);
    expect(res.text).toContain(mockUtils.COMPANY_STATUS_ACTIVE);
    expect(res.text).toContain(mockUtils.COMPANY_TYPE);
    expect(res.text).toContain(mockUtils.COMPANY_INC_DATE);
    expect(res.text).toContain("Your accounts are overdue");
    expect(res.text).toContain(mockUtils.LINE_1);
    expect(res.text).toContain(mockUtils.LINE_2);
    expect(res.text).toContain(mockUtils.POST_CODE);
    expect(res.text).toContain(mockUtils.ACCOUNTS_NEXT_DUE_DATE);
  });

  it("should return a overdue message when both flag true and date has passed", async () => {
    mockCompanyProfile.mockResolvedValue(mockUtils.getDummyCompanyProfile(true, false, true));

    const mockPresent: Date = new Date("2020-01-13");
    mockPresent.setHours(0,0,0);
    jest.spyOn(Date, "now").mockReturnValue(mockPresent.getTime());

    const res = await request(app).get("/promise-to-file/check-company")
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(res.status).toEqual(200);
    expect(res.text).toContain(mockUtils.COMPANY_NAME);
    expect(res.text).toContain(mockUtils.COMPANY_NUMBER);
    expect(res.text).toContain(mockUtils.COMPANY_STATUS_ACTIVE);
    expect(res.text).toContain(mockUtils.COMPANY_TYPE);
    expect(res.text).toContain(mockUtils.COMPANY_INC_DATE);
    expect(res.text).toContain("Your accounts are overdue");
    expect(res.text).toContain(mockUtils.LINE_1);
    expect(res.text).toContain(mockUtils.LINE_2);
    expect(res.text).toContain(mockUtils.POST_CODE);
    expect(res.text).toContain(mockUtils.ACCOUNTS_NEXT_DUE_DATE);
  });

   // TODO test accounts overdue page when this is in place

  it("should show error screen if company number search throws an error", async () => {
    mockCompanyProfile.mockRejectedValue(new Error());

    const res = await request(app)
      .get(pageURLs.PTF_CHECK_COMPANY)
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(res.status).toEqual(500);
    expect(res.text).toContain(GENERIC_ERROR);
    expect(res.text).toContain(TITLE);
  });

  it("should show error screen if company number not present", async () => {
    mockCacheService.mockClear();
    mockCacheService.prototype.constructor.mockImplementationOnce(() => undefined);

    const res = await request(app)
      .get(pageURLs.PTF_CHECK_COMPANY)
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(res.status).toEqual(500);
    expect(mockCompanyProfile).toBeCalledTimes(0);
    expect(res.text).toContain(GENERIC_ERROR);
    expect(res.text).toContain(TITLE);
  });
}
