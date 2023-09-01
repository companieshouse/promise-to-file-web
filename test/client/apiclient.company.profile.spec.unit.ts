import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile";
import CompanyProfileService from "@companieshouse/api-sdk-node/dist/services/company-profile/service";
import Resource from "@companieshouse/api-sdk-node/dist/services/resource";
import { getCompanyProfile } from "../../src/client/apiclient";
import { PTFCompanyProfile } from "../../src/model/company.profile";
import * as mockUtils from "../mock.utils";
import { expect, jest } from "@jest/globals";

jest.mock("@companieshouse/api-sdk-node/dist/services/company-profile/service");

// Dates used when testing the setting of the accounts and confirmation statement 'overdue' flag
const DATE_TODAY: string = "2020-01-31";

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

    it("returns an PTFCompanyProfile object with accounts and confirmation statement overdue", async () => {
        const overdueCompanyProfileResponse = dummySDKResponse;
    overdueCompanyProfileResponse.resource!.accounts.overdue = true;
    overdueCompanyProfileResponse.resource!.confirmationStatement!.overdue = true;
    mockGetCompanyProfile.mockResolvedValueOnce(overdueCompanyProfileResponse);
    const company = await getCompanyProfile("00006400", mockUtils.ACCESS_TOKEN);
    expect(company.isAccountsOverdue).toEqual(true);
    expect(company.isConfirmationStatementOverdue).toEqual(true);
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
});

const dummySDKResponse: Resource<CompanyProfile> = {
    httpStatusCode: 200,
    resource: {
        accounts: {
            nextAccounts: {
                periodEndOn: "2019-10-10",
                periodStartOn: "2019-01-01"
            },
            nextDue: "2020-05-31",
            overdue: false
        },
        companyName: "Girl's school trust",
        companyNumber: "00006400",
        companyStatus: "active",
        companyStatusDetail: "company status detail",
        confirmationStatement: {
            nextDue: "2020-04-30",
            overdue: false,
            nextMadeUpTo: "2020-04-30"
        },
        dateOfCreation: "1872-06-26",
        hasBeenLiquidated: false,
        hasCharges: false,
        hasInsolvencyHistory: false,
        jurisdiction: "england-wales",
        registeredOfficeAddress: {
            addressLineOne: "line1",
            addressLineTwo: "line2",
            careOf: "careOf",
            country: "uk",
            locality: "locality",
            poBox: "123",
            postalCode: "post code",
            premises: "premises",
            region: "region"
        },
        sicCodes: ["123"],
        type: "limited",
        links: {}
    }
};

const notFoundSDKResponse: any = {
    httpStatusCode: 400
};

const expectedProfile: PTFCompanyProfile = {
    accountingPeriodEndOn: "2019-10-10",
    accountingPeriodStartOn: "2019-01-01",
    accountsDue: "31 May 2020",
    address: {
        line_1: "line1",
        line_2: "line2",
        postCode: "post code"
    },
    companyName: "Girl's school trust",
    companyNumber: "00006400",
    companyStatus: "Active",
    companyType: "limited",
    confirmationStatementDue: "30 April 2020",
    incorporationDate: "26 June 1872",
    isAccountsOverdue: false,
    isConfirmationStatementOverdue: false,
    jurisdiction: "england-wales"
};
