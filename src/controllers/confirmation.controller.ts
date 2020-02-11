import { NextFunction, Request, Response } from "express";
import {formatDateForDisplay} from "../client/date.formatter";
import logger from "../logger";
import {PTFCompanyProfile} from "../model/company.profile";
import * as templatePaths from "../model/template.paths";
import * as sessionService from "../services/session.service";
import {ALREADY_SUBMITTED, COMPANY_NUMBER, COMPANY_PROFILE, SIGN_IN_INFO, USER_PROFILE} from "../session/keys";
import {IUserProfile} from "../session/types";

const ACCOUNTS_EXT_DEADLINE_IN_DAYS: number = 28;
const CONFIRMATION_STATEMENT_EXT_DEADLINE_IN_DAYS: number = 14;

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
  const dateRequested: Date = new Date(Date.now());
  const deadlineExtPeriodInDays =
      (companyProfile.isAccountsOverdue) ? ACCOUNTS_EXT_DEADLINE_IN_DAYS : CONFIRMATION_STATEMENT_EXT_DEADLINE_IN_DAYS;
  const updatedDeadline: Date = new Date(dateRequested);
  updatedDeadline.setDate(dateRequested.getDate() + deadlineExtPeriodInDays);

  // TODO LFA-TBC call promise-to-file api

  // TODO LFA-1380 need to add decision "is company still required" as a flag to the session.
  const isRequired: boolean = false;
  if (isRequired) {
    return res.render(templatePaths.CONFIRMATION_STILL_REQUIRED,
     {
       company: companyProfile,
       newDeadline: formatDateForDisplay(updatedDeadline.toUTCString()),
       userEmail: email,
     });
  } else {
    return res.render(templatePaths.CONFIRMATION_NOT_REQUIRED,
     {
        company: companyProfile,
        reason: (companyProfile.isAccountsOverdue) ? "your accounts" : "confirmation statement",
        requestedDate: formatDateForDisplay(dateRequested.toUTCString()),
        userEmail: email,
     });
  }
};

export default [route];
