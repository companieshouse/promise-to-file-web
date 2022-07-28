import { getPromiseToFileSessionValue } from "../../services/session.service";
import createMissingError from "./missing.error"
import { NextFunction, Request, Response } from "express";
import { PTFCompanyProfile } from "model/company.profile";
import AbstractHandler from "../confirmation.handler";
import { COMPANY_PROFILE } from "../../session/keys";
import logger from "../../logger";




export class CompanyProfileHandler extends AbstractHandler{
    
    public handle(req: Request, res: Response, next: NextFunction, ctx: Map<string, any>) : void {
        logger.info("companyProfile controller" );
        const companyProfile: PTFCompanyProfile =   
        getPromiseToFileSessionValue(req.chSession, COMPANY_PROFILE);
        ctx["companyProfile"] = companyProfile;
        ctx["companyNumber"] = companyProfile.companyNumber;

    if (!companyProfile) {
        logger.info("companyProfile not found" );
        next(createMissingError("Company profile"));
    }
    logger.info("move on from company profile")
    return super.handle(req, res, next, ctx);
}
}


