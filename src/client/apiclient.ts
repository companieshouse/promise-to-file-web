import { AxiosRequestConfig, AxiosResponse } from "axios";
import { createApiClient } from "ch-sdk-node";
import { CompanyProfile } from "ch-sdk-node/dist/services/company-profile";
import Resource from "ch-sdk-node/dist/services/resource";
import logger from "../logger";
import { PTFCompanyProfile } from "../model/company.profile";
import { INTERNALAPI_URL } from "../properties";
import { lookupCompanyStatus, lookupCompanyType } from "./api.enumerations";
import { getBaseAxiosRequestConfig, HTTP_POST, makeAPICall } from "./axios.api.call.handler";
import { formatDateForDisplay } from "./date.formatter";

/**
 * Get the company profile from the api. If the company does not exist or there has been an error, an exception
 * will be thrown.
 *
 * @param companyNumber the company number.
 * @param token the bearer security token to use to call the api
 */

export const getCompanyProfile = async (companyNumber: string, token: string): Promise<PTFCompanyProfile> => {
  logger.debug("Creating CH SDK ApiClient");
  const api = createApiClient(undefined, token);

  logger.info(`Looking for company profile with company number ${companyNumber}`);
  const sdkResponse: Resource<CompanyProfile> =
    await api.companyProfile.getCompanyProfile(companyNumber.toUpperCase());

  if (sdkResponse.httpStatusCode >= 400) {
    throw {
      status: sdkResponse.httpStatusCode,
    };
  }

  logger.debug("Data from company profile SDK call " + JSON.stringify(sdkResponse, null, 2));

  const companyProfile = sdkResponse.resource as CompanyProfile;

  const isAccountsDueDatePassed: boolean = checkDueDate(companyProfile.accounts.nextDue);
  const isConfirmationStatementDueDatePassed: boolean = checkDueDate(companyProfile.confirmationStatement.nextDue);

  return {
    accountingPeriodEndOn: companyProfile.accounts.nextAccounts.periodEndOn,
    accountingPeriodStartOn: companyProfile.accounts.nextAccounts.periodStartOn,
    accountsDue: formatDateForDisplay(companyProfile.accounts.nextDue),
    address: {
      line_1: companyProfile.registeredOfficeAddress.addressLineOne,
      line_2: companyProfile.registeredOfficeAddress.addressLineTwo,
      postCode: companyProfile.registeredOfficeAddress.postalCode,
    },
    companyName: companyProfile.companyName,
    companyNumber: companyProfile.companyNumber,
    companyStatus: lookupCompanyStatus(companyProfile.companyStatus),
    companyType: lookupCompanyType(companyProfile.type),
    confirmationStatementDue: formatDateForDisplay(companyProfile.confirmationStatement.nextDue),
    incorporationDate: formatDateForDisplay(companyProfile.dateOfCreation),
    isAccountsOverdue:
      (companyProfile.accounts.overdue) || (isAccountsDueDatePassed),
    isConfirmationStatementOverdue:
      (companyProfile.confirmationStatement.overdue) || (isConfirmationStatementDueDatePassed),
  };
};

/**
 * Sends a request to the Promise To File API. Typically called at the end of the web journey.
 * @param companyNumber
 * @param token API security token
 * @param isStillRequired Is this company still needed
 */
export const callPromiseToFileAPI = async (companyNumber: string, token: string, isStillRequired: boolean):
    Promise<AxiosResponse> => {
  const CURRENT_API_PATH = `${INTERNALAPI_URL}/company/${companyNumber}/promise-to-file/current`;
  const config: AxiosRequestConfig = getBaseAxiosRequestConfig(token);
  config.data = { company_required: isStillRequired };
  config.method = HTTP_POST;
  config.url = CURRENT_API_PATH;
  logger.info(`Calling promise to file current api for company ${companyNumber} with the value of ${isStillRequired}`);
  return await makeAPICall(config);
};

/**
 * Checks if the date supplied as a string is before today and returns true or false.
 *
 * @param dueDateAsString The date to check
 */
const checkDueDate = (dueDateAsString: string): boolean => {
  const currentDate: Date = new Date(Date.now());
  currentDate.setHours(0, 0, 0);
  const dueDate: Date = new Date(dueDateAsString);
  dueDate.setHours(23, 59, 59);
  return dueDate < currentDate;
};
