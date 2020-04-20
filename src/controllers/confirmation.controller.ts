import { AxiosResponse } from "axios";
import { NextFunction, Request, Response } from "express";
import { callPromiseToFileAPI } from "../client/apiclient";
import { formatDateForDisplay } from "../client/date.formatter";
import activeFeature from "../feature.flag";
import logger from "../logger";
import { PTFCompanyProfile } from "../model/company.profile";
import { eligibilityReasonCode } from "../model/eligibilityReasonCode";
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

  // Just show the 'stub' screen if the company is still required but the 'yes' journey isn't yet activated
  if (isStillRequired && !activeFeature(COMPANY_STILL_REQUIRED_FEATURE_FLAG)) {
    logger.debug("Company still required feature flag not active. Rendering stub screen");
    return res.render(Templates.COMPANY_REQUIRED,
      {
        company: companyProfile,
        userEmail: email,
      });
  }

  const token = req.chSession.accessToken() as string;
  let apiResponseData: any;
  let apiResponseStatus: any;
  try {
    // TODO  LFA-1406 Add isSubmitted flag to prevent this being sent twice

    const axiosResponse: AxiosResponse = await callPromiseToFileAPI(companyProfile.companyNumber,
        token, isStillRequired);

    apiResponseData = axiosResponse.data;
    apiResponseStatus = axiosResponse.status;
    logger.debug(`Response data returned from the PTF api call : ${JSON.stringify(apiResponseData)}`);
  } catch (e) {
    logger.error("Error processing application " + JSON.stringify(e));
    return next(e);
  }

  if (isStillRequired) {
    const filingDueOn = apiResponseData.filing_due_on;

    if (apiResponseStatus === 400) {
      const cannotUseReason: string = eligibilityReasonCode[apiResponseData.reason_code];
      if (!cannotUseReason) {
        logger.error("No reason_code in api response" + apiResponseData);
        return next(new Error("No reason_code in api response"));
      }
      if (cannotUseReason !== eligibilityReasonCode.COMPANY_IS_ELIGIBLE) {
        return res.render(Templates.NOT_ELIGIBLE,
          {
            cannotUseReason,
            companyName: companyProfile.companyName,
          });
      }
    }
    logger.debug(`New filing deadline : ${filingDueOn}`);

    if (!filingDueOn) {
      return next(new Error("No new filing due date returned by the PTF API"));
    }

    const overdueFiling: string = getOverdueFiling(companyProfile);

    if (!overdueFiling) {
      return next(new Error("Company still required but neither accounts or confirmation statement are overdue"));
    }

    return res.render(Templates.CONFIRMATION_STILL_REQUIRED,
      {
        company: companyProfile,
        newDeadline: formatDateForDisplay(filingDueOn),
        overdueFiling,
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

const getOverdueFiling = ({isAccountsOverdue, isConfirmationStatementOverdue}): string => {
  let overdueFiling: string = "";

  if (isAccountsOverdue && !isConfirmationStatementOverdue) {
    overdueFiling = "accounts";
  } else if (!isAccountsOverdue && isConfirmationStatementOverdue) {
    overdueFiling = "confirmation statement";
  } else if (isAccountsOverdue && isConfirmationStatementOverdue) {
    overdueFiling = "accounts and confirmation statement";
  }

  return overdueFiling;
};

export default [route];
