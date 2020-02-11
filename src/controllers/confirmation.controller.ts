import { NextFunction, Request, Response } from "express";
import {formatDateForDisplay} from "../client/date.formatter";
import logger from "../logger";
import {PTFCompanyProfile} from "../model/company.profile";
import * as templatePaths from "../model/template.paths";
import * as sessionService from "../services/session.service";
import {ALREADY_SUBMITTED, COMPANY_NUMBER, COMPANY_PROFILE, SIGN_IN_INFO, USER_PROFILE} from "../session/keys";
import {IUserProfile} from "../session/types";

const ACCOUNTS_NEW_DEADLINE: number = 28;
const CS_NEW_DEADLINE: number = 14;

const createMissingError = (item: string): Error => {
    const errMsg: string = item + " missing from session";
    return new Error(errMsg);
};

const route = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const companyProfile: PTFCompanyProfile =
      await sessionService.getPromiseToFileSessionValue(req.chSession, COMPANY_PROFILE);
  const signInInfo = req.chSession.getSignedInInfo();
  const userProfile: IUserProfile = signInInfo[USER_PROFILE] as IUserProfile;

  const email = userProfile.email;
  const dateRequested: Date = new Date(Date.now());
  const extensionPeriodInDays =
      (companyProfile.isAccountsOverdue) ? ACCOUNTS_NEW_DEADLINE : CS_NEW_DEADLINE;
  const extension: Date = new Date(dateRequested);
  extension.setDate(dateRequested.getDate() + extensionPeriodInDays);

  const isSubmitted: boolean = await sessionService.getPromiseToFileSessionValue(req.chSession, ALREADY_SUBMITTED);
  const token: string = req.chSession.accessToken() as string;

  if (!(isSubmitted && token)) {
    try {
      await sessionService.updatePromiseToFileSessionValue(req.chSession, ALREADY_SUBMITTED, true);
      // TODO LFA-TBC call promise-to-file api
    } catch (e) {
       logger.error("Error processing application " + JSON.stringify(e));
       await sessionService.updatePromiseToFileSessionValue(req.chSession, ALREADY_SUBMITTED, false);
       return next(e);
    }
  } else {
    logger.error("Form already submitted, not processing again");
  }

  // TODO LFA-1380 need to add decision "is company still required" as a flag to the session.
  const isRequired: boolean = false;
  if (isRequired) {
    return res.render(templatePaths.CONFIRMATION_STILL_REQUIRED,
     {
       company: companyProfile,
       newDeadline: formatDateForDisplay(extension.toUTCString()),
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
