import { NextFunction, Request, Response } from "express";
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

  // TODO LFA-TBC call promise-to-file api

  const isStillRequired: string = getPromiseToFileSessionValue(req.chSession, IS_STILL_REQUIRED);
  if (isStillRequired === "yes") {
    return res.render(CONFIRMATION_STILL_REQUIRED,
     {
       company: companyProfile,
       userEmail: email,
     });
  } else if (isStillRequired === "no") {
    return res.render(CONFIRMATION_NOT_REQUIRED,
     {
        company: companyProfile,
        reason: (companyProfile.isAccountsOverdue) ? "your accounts" : "confirmation statement",
        userEmail: email,
     });
  } else {
      console.error("Neither yes nor no for some reason but is " + JSON.stringify(isStillRequired) + " why?");
  }
};

export default [route];
