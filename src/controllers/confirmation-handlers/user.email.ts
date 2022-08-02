import AbstractHandler from "../confirmation.handler";

import createMissingError from "./missing.error";
import { USER_PROFILE } from "../../session/keys";
import { NextFunction, Request, Response } from "express";
import { IUserProfile } from "../../session/types";
import logger from "../../logger";

export class UserEmailHandler extends AbstractHandler{
    public handle(req: Request, res: Response, next: NextFunction, ctx:ConfirmationHandlerContext) : void {
        const signInInfo = req.chSession.getSignedInInfo();
        const userProfile: IUserProfile = signInInfo[USER_PROFILE] as IUserProfile;
        const email = userProfile.email;
        ctx.email = email;

        if (!email) {
            logger.info("user email not found");
            return next(createMissingError("User Email"));
        }
        return super.handle(req, res, next, ctx);
    }
}
