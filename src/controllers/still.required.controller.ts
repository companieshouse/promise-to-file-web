import { NextFunction, Request, Response } from "express";
import { check, ValidationError, validationResult } from "express-validator";
import { PTFCompanyProfile } from "../model/company.profile";
import { COMPANY_REQUIRED_NOT_SELECTED } from "../model/error.messages";
import { createGovUkErrorData, GovUkErrorData } from "../model/govuk.error.data";
import { COMPANY_REQUIRED_CONFIRMATION, COMPANY_REQUIRED_WARNING } from "../model/page.urls";
import { Templates } from "../model/template.paths";
import { getPromiseToFileSessionValue, updatePromiseToFileSessionValue } from "../services/session.service";
import { COMPANY_PROFILE, IS_STILL_REQUIRED } from "../session/keys";
import Session from "../session/session";

const validators = [
  check("stillRequired").not().isEmpty().withMessage(COMPANY_REQUIRED_NOT_SELECTED),
];

/**
 * GET controller for still required screen
 * @param req
 * @param res
 * @param next
 */
export const getRoute = async (req: Request, res: Response, next: NextFunction): Promise<void> => {

  const companyProfile: PTFCompanyProfile = getPromiseToFileSessionValue(req.chSession, COMPANY_PROFILE);
  const companyName: string = companyProfile.companyName;
  const backLinkUrl: string = COMPANY_REQUIRED_WARNING.replace(":companyNumber", companyProfile.companyNumber);

  return res.render(Templates.STILL_REQUIRED, {
    backLinkUrl,
    companyName,
    templateName: Templates.STILL_REQUIRED,
  });
};

/**
 * POST controller for still required screen
 * @param req
 * @param res
 * @param next
 */
const postRoute = async (req: Request, res: Response, next: NextFunction): Promise<void> => {

  const errors = validationResult(req);
  const companyProfile: PTFCompanyProfile = getPromiseToFileSessionValue(req.chSession, COMPANY_PROFILE);

  // render errors in the view
  if (!errors.isEmpty()) {
    const errorText = errors.array()
      .map((err: ValidationError) => err.msg)
      .pop() as string;

    return renderPageWithError(res, errorText, companyProfile.companyName);
  } else {
    await addDecisionToSession(req.body.stillRequired, req.chSession);
    const url = COMPANY_REQUIRED_CONFIRMATION.replace(":companyNumber", companyProfile.companyNumber);
    return res.redirect(url);
  }
};

const addDecisionToSession = async (decision: string, session: Session): Promise<void> => {
  const decisionFlag: boolean = decision.toUpperCase() === "YES";
  await updatePromiseToFileSessionValue(session,  IS_STILL_REQUIRED, decisionFlag);
};

const renderPageWithError = (res: Response, errorMessage: string, companyName: string): void => {
  const stillRequiredErrorData: GovUkErrorData = createGovUkErrorData(
    errorMessage,
    "#still-required",
    true,
    "");
  return res.render(Templates.STILL_REQUIRED, {
    companyName,
    errorList: [stillRequiredErrorData],
    stillRequiredError: stillRequiredErrorData,
    templateName: Templates.STILL_REQUIRED,
  });
};

export default [...validators, postRoute];
