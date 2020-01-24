import { NextFunction, Request, Response } from "express";
import logger from "../logger";
import { PTFCompanyProfile } from "../model/company.profile";
import { getCompanyProfile } from "../client/apiclient";
import * as errorMessages from "../model/error.messages";
import * as templatePaths from "../model/template.paths";

export const route = async (req: Request, res: Response, next: NextFunction): Promise<void> => {

    const companyNumber: string = req.chSession.data.ptf_session.company_in_context;
    if (companyNumber) {
        try {
            logger.info(`Company number ${companyNumber} found in session, retrieving company profile`);
            const token: string = req.chSession.accessToken() as string;
            const companyinContext: PTFCompanyProfile = await getCompanyProfile(companyNumber, token);
            logger.info("COMPANY PROFILE " + JSON.stringify(companyinContext));

            return res.render(templatePaths.CHECK_COMPANY,{
                    company: companyinContext,
                });
        } catch (e) {
            logger.error(`Error retrieving company number ${companyNumber} from redis`, e);
            return next(e);
        }
    } else {
        logger.info(errorMessages.NO_COMPANY_NUMBER_IN_SESSION);
        return next(new Error(errorMessages.NO_COMPANY_NUMBER_IN_SESSION));
    }
};

export const confirmCompanyStartRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    return next();
};
