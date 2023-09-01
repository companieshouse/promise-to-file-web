import { NextFunction, Request, Response } from "express";
import { PTFCompanyProfile } from "../model/company.profile";
import { Templates } from "../model/template.paths";
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

    return res.render(Templates.CHECK_COMPANY, {
        company,
        templateName: Templates.CHECK_COMPANY
    });
};

export default [route];
