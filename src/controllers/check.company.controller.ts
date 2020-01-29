import { NextFunction, Request, Response } from "express";
import logger from "../logger";
import { PTFCompanyProfile } from "../model/company.profile";
import { getCompanyProfile } from "../client/apiclient";
import * as errorMessages from "../model/error.messages";
import * as templatePaths from "../model/template.paths";
import * as sessionService from "../services/session.service";

export const route = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const companyNumber: string = sessionService.getCompanyNumberInContext(req.chSession);
  if (companyNumber) {
    try {
      logger.info(`Company number ${companyNumber} found in session, retrieving company profile`);
      const token: string = req.chSession.accessToken() as string;
      const companyinContext: PTFCompanyProfile = await getCompanyProfile(companyNumber, token);
      logger.debug("COMPANY PROFILE " + JSON.stringify(companyinContext));
      const isAccountDueDatePassed: boolean = checkDueDate(companyinContext.accountsDue);
      const isCSDueDatePassed: boolean = checkDueDate(companyinContext.confirmationStatementDue);
      return res.render(templatePaths.CHECK_COMPANY, {
            accountDueDatePassed: isAccountDueDatePassed,
            company: companyinContext,
            csDueDatePassed: isCSDueDatePassed,
      });
    } catch (e) {
      logger.error(`Error retrieving company with number ${companyNumber}`, e);
      return next(e);
    }
  } else {
    logger.info(errorMessages.NO_COMPANY_NUMBER_IN_SESSION);
    return next(new Error(errorMessages.NO_COMPANY_NUMBER_IN_SESSION));
  }
};

const checkDueDate = (date: string): boolean => {
  const currentDate: Date = new Date(Date.now());
  currentDate.setHours(0, 0, 0);
  const dueDate: Date = new Date(date);
  dueDate.setHours(23, 59, 59);
  return dueDate < currentDate;
};

export const confirmCompanyStartRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  // TODO LFA-1178 create overdue page and create ptf request if not overdue
  return next();
};
