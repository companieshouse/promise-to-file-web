import { NextFunction, Request, Response } from "express";
import * as templatePaths from "../model/template.paths";

export const route = async (req: Request, res: Response, next: NextFunction): Promise<void> => {

  const scenario = { company: { PTFRequested: "Yes", accountsDue: "01 January 2020",
    accountsStatus: "overdue", address: "25 No Street, Nowhere, nl2br", companyType: "Private Limited Company",
    csDue: "02 January 2020", csStatus: "overdue", incorporationDate: "01 January 2000",
    name: "Test Company LTD", companyNumber: "00001111", companyStatus: "Active" }};

  return res.render(templatePaths.CHECK_COMPANY, {
    scenario,
    templateName: templatePaths.CHECK_COMPANY,
  });
};

export default [route];
