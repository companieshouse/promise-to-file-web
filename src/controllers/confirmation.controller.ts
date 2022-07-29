import { AxiosResponse } from "axios";
import { NextFunction, Request, Response } from "express";
import { callPromiseToFileAPI } from "../client/apiclient";
import { formatDateForDisplay } from "../client/date.formatter";
import activeFeature from "../feature.flag";
import logger from "../logger";
import { PTFCompanyProfile } from "../model/company.profile";
import { eligibilityReasonCode } from "../model/eligibilityReasonCode";
import { Templates } from "../model/template.paths";
import { COMPANY_STILL_REQUIRED_FEATURE_FLAG } from "../properties";
import { getPromiseToFileSessionValue } from "../services/session.service";
import { COMPANY_PROFILE, IS_STILL_REQUIRED, USER_PROFILE } from "../session/keys";
import { IUserProfile } from "../session/types";
import { CompanyProfileHandler } from "./handler/check.company.profile";
import { UserEmailHandler } from "./handler/user.email";
import { CompanyRequiredHandler } from "./handler/company.required";
import { APIResponseDataHandler } from "./handler/api.response.data";
import { CheckEligiablityHandler } from "./handler/check.eligiabilty";

const createMissingError = (item: string): Error => {
    const errMsg: string = item + " missing from session";
    return new Error(errMsg);
};

/**
 * GET controller for confirmation screen
 * @param req
 * @param res
 * @param next
 */
const route = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  
  const ctx = new Map<string,any>();
  logger.info("confirmation controller" )
  const checkCompanyProfile = new CompanyProfileHandler();
  const userEmail = new UserEmailHandler();
  const companyRequired = new CompanyRequiredHandler();
  const apiResponse = new APIResponseDataHandler();
  const checkEligibilty = new CheckEligiablityHandler();
  
  checkCompanyProfile.setNext(userEmail);
  userEmail.setNext(companyRequired);
  companyRequired.setNext(apiResponse);
  apiResponse.setNext(checkEligibilty)
  

  return checkCompanyProfile.handle(req,res,next, ctx);

}

  


export default [route];
