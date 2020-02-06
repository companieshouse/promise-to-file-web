import {NextFunction, Request, Response} from "express";
import {STILL_REQUIRED} from "../model/template.paths";
import {PTFCompanyProfile} from "../model/company.profile";
import {getPromiseToFileSessionValue} from "../services/session.service";
import {COMPANY_PROFILE} from "../session/keys";

export const route = async (req: Request, res: Response, next: NextFunction): Promise<void> => {

  const company: PTFCompanyProfile = getPromiseToFileSessionValue(req.chSession, COMPANY_PROFILE);

  return res.render(STILL_REQUIRED, {
    company,
    templateName: STILL_REQUIRED,
  });
};

export default [route];
