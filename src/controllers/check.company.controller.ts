import { NextFunction, Request, Response } from "express";
import { PTFCompanyProfile } from "../model/company.profile";
import { Templates } from "../model/template.paths";
import { getPromiseToFileSessionValue, updatePromiseToFileSessionValue } from "../services/session.service";
import { STILL_REQUIRED_ALREADY_SUBMITTED, COMPANY_PROFILE } from "../session/keys";

/**
 * GET controller for check company details screen
 * @param req
 * @param res
 * @param next
 */
export const route = async (req: Request, res: Response, next: NextFunction): Promise<void> => {

  const company: PTFCompanyProfile = getPromiseToFileSessionValue(req.chSession, COMPANY_PROFILE);
  await updatePromiseToFileSessionValue(req.chSession, STILL_REQUIRED_ALREADY_SUBMITTED, false);
  return res.render(Templates.CHECK_COMPANY, {
    company,
    templateName: Templates.CHECK_COMPANY,
  });
};

export default [route];
