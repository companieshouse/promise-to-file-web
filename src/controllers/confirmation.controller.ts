import { NextFunction, Request, Response } from "express";
import {PTFCompanyProfile} from "../model/company.profile";
import * as templatePaths from "../model/template.paths";
import * as sessionService from "../services/session.service";
import {COMPANY_PROFILE, USER_PROFILE} from "../session/keys";
import {IUserProfile} from "../session/types";

const createMissingError = (item: string): Error => {
    const errMsg: string = item + " missing from session";
    return new Error(errMsg);
};

const route = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const companyProfile: PTFCompanyProfile =
      await sessionService.getPromiseToFileSessionValue(req.chSession, COMPANY_PROFILE);

  if (!companyProfile) {
    return next(createMissingError("Company profile"));
  }

  const signInInfo = req.chSession.getSignedInInfo();
  const userProfile: IUserProfile = signInInfo[USER_PROFILE] as IUserProfile;
  const email = userProfile.email;

  if (!email) {
    return next(createMissingError("User Email"));
  }
  // TODO LFA-1169 Calrify what the ext deadline period will be for accounts and cs.

  // TODO LFA-TBC call promise-to-file api

  // TODO LFA-1380 need to add decision "is company still required" as a flag to the session.
  const isRequired: boolean = false;
  if (isRequired) {
    return res.render(templatePaths.CONFIRMATION_STILL_REQUIRED,
     {
       company: companyProfile,
       userEmail: email,
     });
  } else {
    return res.render(templatePaths.CONFIRMATION_NOT_REQUIRED,
     {
        company: companyProfile,
        reason: (companyProfile.isAccountsOverdue) ? "your accounts" : "confirmation statement",
        userEmail: email,
     });
  }
};

export default [route];
