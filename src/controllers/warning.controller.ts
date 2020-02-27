import { NextFunction, Request, Response } from "express";
import { Templates } from "../model/template.paths";
import { getPromiseToFileSessionValue } from "../services/session.service";
import { COMPANY_PROFILE } from "../session/keys";

const route = async (req: Request, res: Response, next: NextFunction): Promise<void> => {

  const companyName: string = getPromiseToFileSessionValue(req.chSession, COMPANY_PROFILE).companyName;
  const companyNumber: string = getPromiseToFileSessionValue(req.chSession, COMPANY_PROFILE).companyNumber;

  return res.render(Templates.WARNING, {
    companyName,
    companyNumber,
    templateName: Templates.WARNING,
  });
};

export default [route];
