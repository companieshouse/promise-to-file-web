import { NextFunction, Request, Response } from "express";
import {callPromiseToFileAPI} from "../client/apiclient";
import logger from "../logger";
import { PTFCompanyProfile } from "../model/company.profile";
import { CONFIRMATION_NOT_REQUIRED, CONFIRMATION_STILL_REQUIRED } from "../model/template.paths";
import {getPromiseToFileSessionValue} from "../services/session.service";
import {COMPANY_PROFILE, IS_STILL_REQUIRED, USER_PROFILE} from "../session/keys";
import {IUserProfile} from "../session/types";

const createMissingError = (item: string): Error => {
    const errMsg: string = item + " missing from session";
    return new Error(errMsg);
};

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

  const token: string = req.chSession.accessToken() as string;
  try {
    if (token) {
      // TODO  LFA-TBC Add isSubmitted flag to prevent this being sent twice
      await callPromiseToFileAPI(companyProfile.companyNumber, token, isStillRequired);
    }
  } catch (e) {
    logger.error("Error processing application " + JSON.stringify(e));
    return next(e);
  }

  if (isStillRequired) {
    return res.render(CONFIRMATION_STILL_REQUIRED,
     {
       company: companyProfile,
       userEmail: email,
     });
  } else {
    return res.render(CONFIRMATION_NOT_REQUIRED,
    {
      company: companyProfile,
      reason: (companyProfile.isAccountsOverdue) ? "your accounts" : "confirmation statement",
      userEmail: email,
    });
  }
};

export default [route];
