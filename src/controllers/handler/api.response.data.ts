import { COMPANY_STILL_REQUIRED_FEATURE_FLAG } from "properties";
import AbstractHandler from "../confirmation.handler";
import { NextFunction, Request, Response } from "express";
import { AxiosResponse } from "axios";
import { callPromiseToFileAPI } from "../../client/apiclient";
import logger from "../../logger";
import { Templates } from "../../model/template.paths";

import { eligibilityReasonCode } from "../../model/eligibilityReasonCode";
import { formatDateForDisplay } from "client/date.formatter";

export class APIResponseDataHandler extends AbstractHandler {
  public async handle(req: Request,res: Response,next: NextFunction,ctx: Map<string, any>): Promise<void> {
    const token = req.chSession.accessToken() as string;
    logger.info(`api response data controller`); 
    let apiResponseData: any;
    let apiResponseStatus: any;
    const companyProfile = ctx["companyProfile"];
    const companyNumber = ctx["companyNumber"];
    const isStillRequired = ctx["isStillRequired"];
    logger.info(callPromiseToFileAPI);
    try {
      logger.info(`calling API...`); 
      const axiosResponse: AxiosResponse = await callPromiseToFileAPI(
        companyNumber,
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
      ctx["apiResponseData"] = apiResponseData;
      ctx["apiResponseStatus"] = apiResponseStatus;
    return super.handle(req, res, next, ctx);
  }
}