import {PTFCompanyProfile} from "../../src/model/company.profile";
import {getCompanyProfile} from "../../src/client/apiclient";
import * as mockUtils from "../mock.utils";
import Resource from "ch-sdk-node/dist/services/resource";
import {CompanyProfile} from "ch-sdk-node/dist/services/company-profile";
import CompanyProfileService from "ch-sdk-node/dist/services/company-profile/service";

jest.mock("ch-sdk-node/dist/services/company-profile/service");

// Dates used when testing the setting of the accounts and confirmation statement 'overdue' flag
const DATE_TODAY: string = "2020-01-31";
const DATE_YESTERDAY: string = "2020-01-30";
const DATE_IN_FUTURE: string = "2020-05-17";
const DATE_IN_PAST: string = "2019-08-03";

describe("apiclient company profile unit tests", () => {
  const mockGetCompanyProfile = (CompanyProfileService.prototype.getCompanyProfile as jest.Mock);

  beforeEach(() => {
    mockGetCompanyProfile.mockReset();

    // 'Controlling' today's date when running the tests means that tests will continue to behave as expected
    // in the future
    const mockPresent: Date = new Date(DATE_TODAY);
    mockPresent.setHours(0, 0, 0);
    jest.spyOn(Date, "now").mockReturnValue(mockPresent.getTime());
  });

  it("converts company number to uppercase", async () => {
    mockGetCompanyProfile.mockResolvedValueOnce(dummySDKResponse);
    const company = await getCompanyProfile("sc100079", mockUtils.ACCESS_TOKEN);
    expect(company.incorporationDate).toEqual("26 June 1872");
    expect(mockGetCompanyProfile).toBeCalledWith("SC100079");
  });

  it("returns an PTFCompanyProfile object", async () => {
    mockGetCompanyProfile.mockResolvedValueOnce(dummySDKResponse);
    const company = await getCompanyProfile("00006400", mockUtils.ACCESS_TOKEN);
    expect(company).toEqual(expectedProfile);
  });

  it("returns a 400 status code when company is not found", async () => {
    mockGetCompanyProfile.mockResolvedValueOnce(notFoundSDKResponse);
    try {
        await getCompanyProfile("", mockUtils.ACCESS_TOKEN);
    } catch (e) {
        expect(e.status).toEqual(400);
    }
    expect.assertions(1);
  });

  it("correctly sets the overdue accounts flag if false in company profile but due date has passed",
      async () => {
    // Both here and in the tests below, create a deep copy of the dummy company profile before changing
    // values, to ensure test isolation
    const companyWithOverriddenAccountsDueData: Resource<CompanyProfile> =
        JSON.parse(JSON.stringify(dummySDKResponse));
    companyWithOverriddenAccountsDueData.resource.accounts.overdue = false;
    companyWithOverriddenAccountsDueData.resource.accounts.nextDue = DATE_IN_PAST;
    mockGetCompanyProfile.mockResolvedValueOnce(companyWithOverriddenAccountsDueData);
    const company = await getCompanyProfile("00006400", mockUtils.ACCESS_TOKEN);
    expect(company.isAccountsOverdue).toEqual(true);
  });

  it("correctly sets the overdue accounts flag if false in company profile and due date is today",
      async () => {
    const companyWithOverriddenAccountsDueData: Resource<CompanyProfile> =
        JSON.parse(JSON.stringify(dummySDKResponse));
    companyWithOverriddenAccountsDueData.resource.accounts.overdue = false;
    companyWithOverriddenAccountsDueData.resource.accounts.nextDue = DATE_TODAY;
    mockGetCompanyProfile.mockResolvedValueOnce(companyWithOverriddenAccountsDueData);
    const company = await getCompanyProfile("00006400", mockUtils.ACCESS_TOKEN);
    expect(company.isAccountsOverdue).toEqual(false);
  });

  it("correctly sets the overdue accounts flag if false in company profile and due date is yesterday",
      async () => {
    const companyWithOverriddenAccountsDueData: Resource<CompanyProfile> =
        JSON.parse(JSON.stringify(dummySDKResponse));
    companyWithOverriddenAccountsDueData.resource.accounts.overdue = false;
    companyWithOverriddenAccountsDueData.resource.accounts.nextDue = DATE_YESTERDAY;
    mockGetCompanyProfile.mockResolvedValueOnce(companyWithOverriddenAccountsDueData);
    const company = await getCompanyProfile("00006400", mockUtils.ACCESS_TOKEN);
    expect(company.isAccountsOverdue).toEqual(true);
  });

  it("correctly sets the overdue accounts flag if true in company profile but due date has not passed",
      async () => {
    const companyWithOverriddenAccountsDueData: Resource<CompanyProfile> =
        JSON.parse(JSON.stringify(dummySDKResponse));
    companyWithOverriddenAccountsDueData.resource.accounts.overdue = true;
    companyWithOverriddenAccountsDueData.resource.accounts.nextDue = DATE_IN_FUTURE;
    mockGetCompanyProfile.mockResolvedValueOnce(companyWithOverriddenAccountsDueData);
    const company = await getCompanyProfile("00006400", mockUtils.ACCESS_TOKEN);
    expect(company.isAccountsOverdue).toEqual(true);
  });

  it("correctly sets the overdue accounts flag if false in company profile and due date has not passed",
      async () => {
    const companyWithOverriddenAccountsDueData: Resource<CompanyProfile> =
        JSON.parse(JSON.stringify(dummySDKResponse));
    companyWithOverriddenAccountsDueData.resource.accounts.overdue = false;
    companyWithOverriddenAccountsDueData.resource.accounts.nextDue = DATE_IN_FUTURE;
    mockGetCompanyProfile.mockResolvedValueOnce(companyWithOverriddenAccountsDueData);
    const company = await getCompanyProfile("00006400", mockUtils.ACCESS_TOKEN);
    expect(company.isAccountsOverdue).toEqual(false);
  });

  it("correctly sets the overdue confirmation statement flag if false in company profile but due date has passed",
      async () => {
    const companyWithOverriddenConfirmationStatementDueData: Resource<CompanyProfile> =
        JSON.parse(JSON.stringify(dummySDKResponse));
    companyWithOverriddenConfirmationStatementDueData.resource.confirmationStatement.overdue = false;
    companyWithOverriddenConfirmationStatementDueData.resource.confirmationStatement.nextDue = DATE_IN_PAST;
    mockGetCompanyProfile.mockResolvedValueOnce(companyWithOverriddenConfirmationStatementDueData);
    const company = await getCompanyProfile("00006400", mockUtils.ACCESS_TOKEN);
    expect(company.isConfirmationStatementOverdue).toEqual(true);
  });

  it("correctly sets the overdue confirmation statement flag if false in company profile and due date is today",
      async () => {
    const companyWithOverriddenConfirmationStatementDueData: Resource<CompanyProfile> =
        JSON.parse(JSON.stringify(dummySDKResponse));
    companyWithOverriddenConfirmationStatementDueData.resource.confirmationStatement.overdue = false;
    companyWithOverriddenConfirmationStatementDueData.resource.confirmationStatement.nextDue = DATE_TODAY;
    mockGetCompanyProfile.mockResolvedValueOnce(companyWithOverriddenConfirmationStatementDueData);
    const company = await getCompanyProfile("00006400", mockUtils.ACCESS_TOKEN);
    expect(company.isConfirmationStatementOverdue).toEqual(false);
  });

  it("correctly sets the overdue confirmation statement flag if false in company profile and due date is yesterday",
      async () => {
    const companyWithOverriddenConfirmationStatementDueData: Resource<CompanyProfile> =
        JSON.parse(JSON.stringify(dummySDKResponse));
    companyWithOverriddenConfirmationStatementDueData.resource.confirmationStatement.overdue = false;
    companyWithOverriddenConfirmationStatementDueData.resource.confirmationStatement.nextDue = DATE_YESTERDAY;
    mockGetCompanyProfile.mockResolvedValueOnce(companyWithOverriddenConfirmationStatementDueData);
    const company = await getCompanyProfile("00006400", mockUtils.ACCESS_TOKEN);
    expect(company.isConfirmationStatementOverdue).toEqual(true);
  });

  it("correctly sets the overdue confirmation statement flag if true in company profile but due date has not passed",
      async () => {
    const companyWithOverriddenConfirmationStatementDueData: Resource<CompanyProfile> =
        JSON.parse(JSON.stringify(dummySDKResponse));
    companyWithOverriddenConfirmationStatementDueData.resource.confirmationStatement.overdue = true;
    companyWithOverriddenConfirmationStatementDueData.resource.confirmationStatement.nextDue = DATE_IN_FUTURE;
    mockGetCompanyProfile.mockResolvedValueOnce(companyWithOverriddenConfirmationStatementDueData);
    const company = await getCompanyProfile("00006400", mockUtils.ACCESS_TOKEN);
    expect(company.isConfirmationStatementOverdue).toEqual(true);
  });

  it("correctly sets the overdue confirmation statement flag if false in company profile and due date has not passed",
      async () => {
    const companyWithOverriddenConfirmationStatementDueData: Resource<CompanyProfile> =
        JSON.parse(JSON.stringify(dummySDKResponse));
    companyWithOverriddenConfirmationStatementDueData.resource.confirmationStatement.overdue = false;
    companyWithOverriddenConfirmationStatementDueData.resource.confirmationStatement.nextDue = DATE_IN_FUTURE;
    mockGetCompanyProfile.mockResolvedValueOnce(companyWithOverriddenConfirmationStatementDueData);
    const company = await getCompanyProfile("00006400", mockUtils.ACCESS_TOKEN);
    expect(company.isConfirmationStatementOverdue).toEqual(false);
  });

});

const dummySDKResponse: Resource<CompanyProfile> = {
  httpStatusCode: 200,
  resource: {
    accounts: {
        nextAccounts: {
            periodEndOn: "2019-10-10",
            periodStartOn: "2019-01-01",
        },
        nextDue: "2020-05-31",
        overdue: false,
    },
    companyName: "Girl's school trust",
    companyNumber: "00006400",
    companyStatus: "active",
    companyStatusDetail: "company status detail",
    confirmationStatement: {
        nextDue: "2020-04-30",
        overdue: false,
    },
    dateOfCreation: "1872-06-26",
    hasBeenLiquidated: false,
    hasCharges: false,
    hasInsolvencyHistory: false,
    registeredOfficeAddress: {
        addressLineOne: "line1",
        addressLineTwo: "line2",
        careOf: "careOf",
        country: "uk",
        locality: "locality",
        poBox: "123",
        postalCode: "post code",
        premises: "premises",
        region: "region",
    },
    sicCodes: ["123"],
    type: "limited",
  },
};

const notFoundSDKResponse: any = {
    httpStatusCode: 400,
};

const expectedProfile: PTFCompanyProfile = {
  accountingPeriodEndOn: "2019-10-10",
  accountingPeriodStartOn: "2019-01-01",
  accountsDue: "31 May 2020",
  address: {
    line_1: "line1",
    line_2: "line2",
    postCode: "post code",
  },
  companyName: "Girl's school trust",
  companyNumber: "00006400",
  companyStatus: "Active",
  companyType: "limited",
  confirmationStatementDue: "30 April 2020",
  incorporationDate: "26 June 1872",
  isAccountsOverdue: false,
  isConfirmationStatementOverdue: false,
};
