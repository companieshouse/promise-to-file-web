import app from "../../src/app";
import * as request from "supertest";
import {loadSession} from "../../src/services/redis.service";
import * as mockUtils from "../mock.utils";
import {COOKIE_NAME} from "../../src/properties";
import * as pageURLs from "../../src/model/page.urls";
import {getCompanyProfile} from "../../src/client/apiclient";

jest.mock("../../src/session/store/redis.store", () => import("../mocks/redis.store.mock.factory"));
jest.mock("../../src/services/redis.service");
jest.mock("../../src/client/apiclient");

const COMPANY_NUMBER = "00006400";
const NO_COMPANY_NUMBER_SUPPLIED = "No company number supplied";
const INVALID_COMPANY_NUMBER = "Invalid company number";
const COMPANY_NUMBER_TOO_LONG = "Company number too long";
const COMPANY_NOT_FOUND: string = "Company number not found";

describe("company number validation tests", () => {

  const mockCacheService = loadSession as jest.Mock;
  const mockCompanyProfile: jest.Mock = (getCompanyProfile as unknown as jest.Mock<typeof getCompanyProfile>);

  beforeEach(() => {
    mockUtils.loadMockSession(mockCacheService);
  });

  it("should find company number page", async () => {
    const response = await request(app)
      .get("/promise-to-file/company-number")
      .set("Referer", "/")
      .set("Cookie", [`${COOKIE_NAME}=123`]);

    expect(response.status).toEqual(200);
    expect(response.text).toMatch(/What is the company number/);
  });

  it("should create an error message when no company number is supplied (empty string)", async () => {
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

  it("should create an error message when no company number is supplied (spaces)", async () => {
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

  it("should create an error message when company number is invalid (characters)", async () => {
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

  it("should create an error message when company number is too long", async () => {
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

  it("should create an error message when company is not found", async () => {
    mockCompanyProfile.mockImplementation(() => {
      throw {
        message: COMPANY_NOT_FOUND,
        status: 404,
      };
    });

    const response = await request(app)
      .post(pageURLs.PROMISE_TO_FILE_COMPANY_NUMBER)
      .set("Accept", "application/json")
      .set("Cookie", [`${COOKIE_NAME}=123`])
      .send({companyNumber: "00012345"});

    expect(response.status).toEqual(200);
    expect(response).not.toBeUndefined();
    expect(response.text).not.toContain(NO_COMPANY_NUMBER_SUPPLIED);
    expect(response.text).not.toContain(INVALID_COMPANY_NUMBER);
    expect(response.text).not.toContain(COMPANY_NUMBER_TOO_LONG);
    expect(response.text).toContain(COMPANY_NOT_FOUND);
  });

  it("should redirect to the check company details screen when company is found", async () => {
    mockCompanyProfile.mockResolvedValue(mockUtils.getDummyCompanyProfile(true, true));

    const response = await request(app)
      .post(pageURLs.PROMISE_TO_FILE_COMPANY_NUMBER)
      .set("Accept", "application/json")
      .set("Cookie", [`${COOKIE_NAME}=123`])
      .send({companyNumber: COMPANY_NUMBER});

    expect(response.header.location).toEqual(pageURLs.PROMISE_TO_FILE_CHECK_COMPANY);
    expect(response.status).toEqual(302);
    expect(mockCompanyProfile).toHaveBeenCalledWith(COMPANY_NUMBER, mockUtils.ACCESS_TOKEN);
  });

});
