import { NextFunction, Request, Response } from "express";
import {formatDateForDisplay} from "../client/date.formatter";
import logger from "../logger";
import {PTFCompanyProfile} from "../model/company.profile";
import * as templatePaths from "../model/template.paths";
import * as sessionService from "../services/session.service";
import {ALREADY_SUBMITTED, COMPANY_NUMBER, COMPANY_PROFILE, SIGN_IN_INFO, USER_PROFILE} from "../session/keys";
import {ISignInInfo, IUserProfile} from "../session/types";

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
      (companyProfile.isAccountsOverdue) ? 28 : 14;
  const extension: Date = new Date(dateRequested);
  extension.setDate(dateRequested.getDate() + extensionPeriodInDays);

  // TODO need to add decision "is company still required" as a flag to the session.
  const isRequired: boolean = false;
  const isSubmitted: boolean = await sessionService.getPromiseToFileSessionValue(req.chSession, ALREADY_SUBMITTED);
  const token: string = req.chSession.accessToken() as string;
  if (!(isSubmitted && token)) {
    try {
      await sessionService.updatePromiseToFileSessionValue(req.chSession, ALREADY_SUBMITTED, true);
      // TODO call promise-to-file api ?
    } catch (e) {
       logger.error("Error processing application " + JSON.stringify(e));
       await sessionService.updatePromiseToFileSessionValue(req.chSession, ALREADY_SUBMITTED, false);
       return next(e);
    }
  } else {
    logger.error("Form already submitted, not processing again");
  }

  if (isRequired) {
    return res.render(templatePaths.CONFIRMATION_REQUIRED,
     {
       company: companyProfile,
       newDeadline: formatDateForDisplay(extension.toUTCString()),
       userEmail: email,
     });
  } else {
    return res.render(templatePaths.CONFIRMATION_NOT_REQUIRED,
     {
        company: companyProfile,
        reason: (companyProfile.isAccountsOverdue) ? "your accounts" : "the confirmation statement",
        requestedDate: formatDateForDisplay(dateRequested.toUTCString()),
        userEmail: email,
      });
  }
};

export default [route];
