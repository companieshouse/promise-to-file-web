import { NextFunction, Request, Response } from "express";
import { PTFCompanyProfile } from "model/company.profile";
import { getPromiseToFileSessionValue } from "../../services/session.service";
import { COMPANY_PROFILE } from "../../session/keys";
import AbstractHandler from "../confirmation.handler";
import createMissingError from "./missing.error";
import ConfirmationHandlerContext from "../../utils/confirmation.handler.context";

export class CompanyProfileHandler extends AbstractHandler {

    public handle (req: Request, res: Response, next: NextFunction, ctx: ConfirmationHandlerContext): void {

        const companyProfile: PTFCompanyProfile = getPromiseToFileSessionValue(req.chSession, COMPANY_PROFILE);
        ctx.companyProfile = companyProfile;

        if (!companyProfile) {
            return next(createMissingError("Company profile not present"));
        }
        return super.handle(req, res, next, ctx);
    }
}
