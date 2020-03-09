import { NextFunction, Request, Response } from "express";
import { callPromiseToFileAPI } from "../client/apiclient";
import activeFeature from "../feature.flag";
import logger from "../logger";
import { PTFCompanyProfile } from "../model/company.profile";
import { Templates } from "../model/template.paths";
import { COMPANY_STILL_REQUIRED_FEATURE_FLAG } from "../properties";
import { getPromiseToFileSessionValue } from "../services/session.service";
import { COMPANY_PROFILE, IS_STILL_REQUIRED, USER_PROFILE } from "../session/keys";
import { IUserProfile } from "../session/types";

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
  const companyProfile: PTFCompanyProfile =
    getPromiseToFileSessionValue(req.chSession, COMPANY_PROFILE);

  if (!companyProfile) {
    return next(createMissingError("Company profile"));
  }

  const signInInfo = req.chSession.getSignedInInfo();
  const userProfile: IUserProfile = signInInfo[USER_PROFILE] as IUserProfile;
  const email = userProfile.email;

  if (!email) {
    return next(createMissingError("User Email"));
  }
  // TODO LFA-1169 Clarify what the ext deadline period will be for accounts and cs.

  const isStillRequired: boolean = getPromiseToFileSessionValue(req.chSession, IS_STILL_REQUIRED);

  const token = req.chSession.accessToken() as string;
  try {
    // TODO  LFA-1406 Add isSubmitted flag to prevent this being sent twice

    // TODO  LFA-1320: Remove this check when the 'still required' email is implemented
    if (!isStillRequired) {
      await callPromiseToFileAPI(companyProfile.companyNumber, token, isStillRequired);
    }
  } catch (e) {
    logger.error("Error processing application " + JSON.stringify(e));
    return next(e);
  }

  if (isStillRequired) {
    if (activeFeature(COMPANY_STILL_REQUIRED_FEATURE_FLAG)) {
      return res.render(Templates.CONFIRMATION_STILL_REQUIRED,
        {
          company: companyProfile,
          userEmail: email,
        });
    } else {
      return res.render(Templates.COMPANY_REQUIRED,
        {
          company: companyProfile,
          userEmail: email,
        });
    }
  } else {
    return res.render(Templates.CONFIRMATION_NOT_REQUIRED,
      {
        company: companyProfile,
        overdueFiling: (companyProfile.isAccountsOverdue) ? "accounts" : "confirmation statement",
        userEmail: email,
      });
  }
};

export default [route];
