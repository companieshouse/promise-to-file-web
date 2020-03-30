import { AxiosResponse } from "axios";
import { NextFunction, Request, Response } from "express";
import { callPromiseToFileAPI } from "../client/apiclient";
import { formatDateForDisplay } from "../client/date.formatter";
import activeFeature from "../feature.flag";
import logger from "../logger";
import { PTFCompanyProfile } from "../model/company.profile";
import { Templates } from "../model/template.paths";
import { COMPANY_STILL_REQUIRED_FEATURE_FLAG } from "../properties";
import { getPromiseToFileSessionValue, updatePromiseToFileSessionValue } from "../services/session.service";
import { ALREADY_SUBMITTED, COMPANY_PROFILE, IS_STILL_REQUIRED, NEW_DEADLINE, USER_PROFILE } from "../session/keys";
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

  // Just show the 'stub' screen if the company is still required but the 'yes' journey isn't yet activated
  if (isStillRequired && !activeFeature(COMPANY_STILL_REQUIRED_FEATURE_FLAG)) {
    logger.debug("Company still required feature flag not active. Rendering stub screen");
    return res.render(Templates.COMPANY_REQUIRED,
      {
        company: companyProfile,
        userEmail: email,
      });
  }

  const isSubmitted: boolean = getPromiseToFileSessionValue(req.chSession, ALREADY_SUBMITTED);
  if (!isSubmitted) {
    const token = req.chSession.accessToken() as string;
    let apiResponseData: any;
    try {

        const axiosResponse: AxiosResponse = await callPromiseToFileAPI(companyProfile.companyNumber,
            token, isStillRequired);

        apiResponseData = axiosResponse.data;
        await updatePromiseToFileSessionValue(req.chSession, NEW_DEADLINE, apiResponseData.filing_due_on);
        await updatePromiseToFileSessionValue(req.chSession, ALREADY_SUBMITTED, true);

        logger.debug(`Response data returned from the PTF api call : ${JSON.stringify(apiResponseData)}`);
    } catch (e) {
        logger.error("Error processing application " + JSON.stringify(e));
        await updatePromiseToFileSessionValue(req.chSession, ALREADY_SUBMITTED, false);
        return next(e);
    }
  } else {
      logger.error("Form already submitted, not processing again");
  }

  if (isStillRequired) {
    const filingDueOn =  getPromiseToFileSessionValue(req.chSession, NEW_DEADLINE);
    logger.debug(`New filing deadline : ${filingDueOn}`);

    if (!filingDueOn) {
      return next(new Error("No new filing due date returned by the PTF API"));
    }

    return res.render(Templates.CONFIRMATION_STILL_REQUIRED,
      {
        company: companyProfile,
        newDeadline: formatDateForDisplay(filingDueOn),
        userEmail: email,
      });
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
