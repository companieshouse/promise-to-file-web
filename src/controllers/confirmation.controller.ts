import { NextFunction, Request, Response } from "express";
import logger from "../logger";
import { CompanyProfileHandler } from "./handler/check.company.profile";
import { UserEmailHandler } from "./handler/user.email";
import { CompanyRequiredHandler } from "./handler/company.required";
import { APIResponseDataHandler } from "./handler/api.response.data";
import { CheckEligibilityHandler } from "./handler/check.eligibility";

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
  const checkEligibility = new CheckEligibilityHandler();
  
  checkCompanyProfile.setNext(userEmail);
  userEmail.setNext(companyRequired);
  companyRequired.setNext(apiResponse);
  apiResponse.setNext(checkEligibility)
  

  return checkCompanyProfile.handle(req,res,next, ctx);

}

  


export default [route];
