import { NextFunction, Request, Response } from "express";
import { APIResponseDataHandler } from "./confirmation-handlers/api.response.data";
import { CompanyProfileHandler } from "./confirmation-handlers/check.company.profile";
import { CheckEligibilityHandler } from "./confirmation-handlers/check.eligibility";
import { CompanyRequiredHandler } from "./confirmation-handlers/company.required";
import { UserEmailHandler } from "./confirmation-handlers/user.email";
import ConfirmationHandlerContext from "../utils/confirmation.handler.context";

/**
 * GET controller for confirmation screen
 * @param req
 * @param res
 * @param next
 */
const route = async (req: Request, res: Response, next: NextFunction): Promise<void> => {

    const cxt = {} as ConfirmationHandlerContext;

    const checkCompanyProfile = new CompanyProfileHandler();
    const userEmail = new UserEmailHandler();
    const companyRequired = new CompanyRequiredHandler();
    const apiResponse = new APIResponseDataHandler();
    const checkEligibility = new CheckEligibilityHandler();

    checkCompanyProfile.setNext(userEmail);
    userEmail.setNext(companyRequired);
    companyRequired.setNext(apiResponse);
    apiResponse.setNext(checkEligibility);

    return checkCompanyProfile.handle(req, res, next, cxt);

};

export default [route];
