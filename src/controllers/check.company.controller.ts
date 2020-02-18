import { NextFunction, Request, Response } from "express";
import { PTFCompanyProfile } from "../model/company.profile";
import { CHECK_COMPANY } from "../model/template.paths";
import { getPromiseToFileSessionValue } from "../services/session.service";
import { COMPANY_PROFILE } from "../session/keys";

/**
 * GET controller for check company details screen
 * @param req 
 * @param res 
 * @param next 
 */
export const route = async (req: Request, res: Response, next: NextFunction): Promise<void> => {

  const company: PTFCompanyProfile = getPromiseToFileSessionValue(req.chSession, COMPANY_PROFILE);

  return res.render(CHECK_COMPANY, {
    company,
    templateName: CHECK_COMPANY,
  });
};

export default [route];
