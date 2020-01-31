import { NextFunction, Request, Response } from "express";
import * as templatePaths from "../model/template.paths";
import { PTFCompanyProfile } from "../model/company.profile";

export const route = async (req: Request, res: Response, next: NextFunction): Promise<void> => {

  const company: PTFCompanyProfile = { accountingPeriodEndOn: "", accountingPeriodStartOn: "",
  accountsDue: "01 January 2020", address: { line_1: "25 No Street", line_2: "Nowhere", postCode: "nl2br" },
  companyName: "Test Company LTD", companyNumber: "00001111", companyStatus: "Active",
  companyType: "Private Limited Company", confirmationStatementDue: "02 January 2020",
  incorporationDate: "01 January 2000", isAccountsOverdue: true, isConfirmationStatementOverdue: true };

  return res.render(templatePaths.CHECK_COMPANY, {
    company,
    templateName: templatePaths.CHECK_COMPANY,
  });
};

export default [route];
