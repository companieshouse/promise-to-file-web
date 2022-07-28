import { COMPANY_STILL_REQUIRED_FEATURE_FLAG } from "properties";
import AbstractHandler from "../confirmation.handler";
import { NextFunction, Request, Response } from "express";
import { AxiosResponse } from "axios";
import { callPromiseToFileAPI } from "../../client/apiclient";
import logger from "../../logger";
import { Templates } from "../../model/template.paths";

import { eligibilityReasonCode } from "../../model/eligibilityReasonCode";

export class APIResponseData extends AbstractHandler {
  public async handle(req: Request,res: Response,next: NextFunction,ctx: Map<string, any>): Promise<void> {
    const token = req.chSession.accessToken() as string;
    let apiResponseData: any;
    let apiResponseStatus: any;
    const companyProfile = ctx["companyProfile"];
    const companyNumber = ctx["companyNumber"];
    const isStillRequired = ctx["isStillRequired"];
    try {
      const axiosResponse: AxiosResponse = await callPromiseToFileAPI(
        companyNumber,
        token,
        isStillRequired
      );

      apiResponseData = axiosResponse.data;
      apiResponseStatus = axiosResponse.status;
      logger.debug(
        `Response data returned from the PTF api call : ${JSON.stringify(
          apiResponseData
        )}`
      );
    } catch (e) {
      logger.error("Error processing application " + JSON.stringify(e));
      return next(e);
    }
    const overdueFiling: string = getOverdueFiling(companyProfile);

    if (isStillRequired) {
      const filingDueOn = apiResponseData.filing_due_on;
      logger.info({filingDueOn} + ` :filing due on date`) 
      if (apiResponseStatus === 400) {
        const cannotUseReason: string =
          eligibilityReasonCode[apiResponseData.reason_code];
        if (!cannotUseReason) {
          logger.error("No reason_code in api response" + apiResponseData);
          return next(new Error("No reason_code in api response"));
        }

        return res.render(Templates.NOT_ELIGIBLE, {
          cannotUseReason,
          companyName: companyProfile.companyName,
          overdueFiling,
          showLFPWarning: companyProfile.isAccountsOverdue,
          singleOrPluralText:
            overdueFiling === "confirmation statement" ? "is" : "are",
        });
      }
      logger.debug(`New filing deadline : ${filingDueOn}`);
    }
    return super.handle(req, res, next, ctx);
  }
}
const getOverdueFiling = ({
  isAccountsOverdue,
  isConfirmationStatementOverdue,
}): string => {
  let overdueFiling: string = "";

  if (isAccountsOverdue && !isConfirmationStatementOverdue) {
    overdueFiling = "accounts";
  } else if (!isAccountsOverdue && isConfirmationStatementOverdue) {
    overdueFiling = "confirmation statement";
  } else if (isAccountsOverdue && isConfirmationStatementOverdue) {
    overdueFiling = "accounts and confirmation statement";
  } else {
    // TODO Neither the accounts or the confirmation statement are overdue - handle this
    //      output with appropriate render when story is created.
    overdueFiling = "nothing overdue";
  }

  return overdueFiling;
};
