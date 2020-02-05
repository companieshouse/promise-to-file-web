import { NextFunction, Request, Response } from "express";
import * as templatePaths from "../model/template.paths";
import { PTFCompanyProfile } from "../model/company.profile";
import {getPromiseToFileSessionValue} from "../services/session.service";
import {COMPANY_PROFILE} from "../session/keys";

export const route = async (req: Request, res: Response, next: NextFunction): Promise<void> => {

  const company: PTFCompanyProfile = getPromiseToFileSessionValue(req.chSession, COMPANY_PROFILE);

  return res.render(templatePaths.CHECK_COMPANY, {
    company,
    templateName: templatePaths.CHECK_COMPANY,
  });
};

export default [route];
