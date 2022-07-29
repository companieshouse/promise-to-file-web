import AbstractHandler from "../confirmation.handler";
import { NextFunction, Request, Response } from "express";
import { eligibilityReasonCode } from "../../model/eligibilityReasonCode";
import logger from "../../logger";
import { Templates } from "../../model/template.paths";
import { formatDateForDisplay } from "../../client/date.formatter";

export class CheckEligiablityHandler extends AbstractHandler {
  public async handle(req: Request,res: Response,next: NextFunction,ctx: Map<string, any>): Promise<void> {
    logger.info("calling eligiabliy handler");
    const companyProfile = ctx["companyProfile"];
    const email = ctx["email"];
    const isStillRequired = ctx["isStillRequired"];
    const apiResponseData = ctx["apiResponseData"];
    const apiResponseStatus = ctx["apiResponseStatus"];
    
    const overdueFiling: string = getOverdueFiling(companyProfile);
    if (isStillRequired) {
      const filingDueOn = apiResponseData.filing_due_on;

      if (apiResponseStatus === 400) {
        const cannotUseReason: string = eligibilityReasonCode[apiResponseData.reason_code];
        if (!cannotUseReason) {
          logger.error("No reason_code in api response" + apiResponseData);
          return next(new Error("No reason_code in api response"));
        }
  
        return res.render(Templates.NOT_ELIGIBLE,
          {
            cannotUseReason,
            companyName: companyProfile.companyName,
            overdueFiling,
            showLFPWarning: companyProfile.isAccountsOverdue,
            singleOrPluralText: (overdueFiling === "confirmation statement") ? "is" : "are",
          });
      }
      logger.debug(`New filing deadline : ${filingDueOn}`);
  
      if (!filingDueOn) {
        return next(new Error("No new filing due date returned by the PTF API"));
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
          overdueFiling,
          showLFPWarning: companyProfile.isAccountsOverdue,
          userEmail: email,
        });
    }
  }};
  
  const getOverdueFiling = ({isAccountsOverdue, isConfirmationStatementOverdue}): string => {
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