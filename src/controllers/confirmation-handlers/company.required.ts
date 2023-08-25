import { NextFunction, Request, Response } from "express";
import activeFeature from "../../feature.flag";
import logger from "../../logger";
import { Templates } from "../../model/template.paths";
import { COMPANY_STILL_REQUIRED_FEATURE_FLAG } from "../../properties";
import { getPromiseToFileSessionValue } from "../../services/session.service";
import { IS_STILL_REQUIRED } from "../../session/keys";
import AbstractHandler from "../confirmation.handler";
import ConfirmationHandlerContext from "../../utils/confirmation.handler.context";

export class CompanyRequiredHandler extends AbstractHandler {
    public handle (req: Request, res: Response, next: NextFunction, ctx: ConfirmationHandlerContext): void {
        const isStillRequired: boolean = getPromiseToFileSessionValue(req.chSession, IS_STILL_REQUIRED
        );
        ctx.isStillRequired = isStillRequired;
        const isActiveFeature = activeFeature(COMPANY_STILL_REQUIRED_FEATURE_FLAG);
        if (isStillRequired && !isActiveFeature) {
            logger.debug(
                "Company still required feature flag not active. Rendering stub screen"
            );
            return res.render(Templates.COMPANY_REQUIRED, {
                company: ctx.companyProfile,
                userEmail: ctx.email
            });
        }
        return super.handle(req, res, next, ctx);
    }
}
