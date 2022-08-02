
import AbstractHandler from "../confirmation.handler";
import { NextFunction, Request, Response } from "express";
import { AxiosResponse } from "axios";
import { callPromiseToFileAPI } from "../../client/apiclient";
import logger from "../../logger";

export class APIResponseDataHandler extends AbstractHandler {
  public async handle(req: Request,res: Response,next: NextFunction,ctx:ConfirmationHandlerContext): Promise<void> {
    const token = req.chSession.accessToken() as string;
    let apiResponseData: any;
    let apiResponseStatus: any;
    const companyProfile = ctx.companyProfile;
    const isStillRequired = !!ctx.isStillRequired;
    try {
      const axiosResponse: AxiosResponse = await callPromiseToFileAPI(
        companyProfile.companyNumber,
        token,
        isStillRequired
      );

      apiResponseData = axiosResponse.data;
      apiResponseStatus = axiosResponse.status;

      logger.debug(
        `Response data returned from the PTF api call : ${JSON.stringify(
          apiResponseData
        )}`
      );
    } catch (e) {
      logger.error("Error processing application " + JSON.stringify(e));
      return next(e);
    }
      ctx.apiResponseData = apiResponseData;
      ctx.apiResponseStatus = apiResponseStatus;
      return super.handle(req, res, next, ctx);
  }
}