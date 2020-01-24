import { NextFunction, Request, Response } from "express";
import logger from "../logger";
import * as sessionService from "../services/session.service";
import * as pageURLs from "../model/page.urls";
import { PTFCompanyProfile } from "../model/company.profile";
import { getCompanyProfile } from "../client/apiclient";
import * as errorMessages from "../model/error.messages";
import { createGovUkErrorData, GovUkErrorData } from "../model/govuk.error.data";
import * as templatePaths from "../model/template.paths";

/**
 * Handle the request for company number lookup.
 */
const route = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // TODO add validation

    const companyNumber: string = req.body.companyNumber;
    try {
        logger.info(`Retrieving company profile for company number ${companyNumber}`);
        const token: string = req.chSession.accessToken() as string;

        // TODO: Place this call somewhere more global so that it not called on check company as well
        const company: PTFCompanyProfile = await getCompanyProfile(companyNumber, token);

        await sessionService.createPromiseToFileSession(req.chSession, company.companyNumber);

        return res.redirect(pageURLs.PTF_CHECK_COMPANY);
    } catch (e) {
        logger.error(`Error fetching company profile for company number ${companyNumber}`, e);
        if (e.status === 404) {
            buildError(res, errorMessages.COMPANY_NUMBER_NOT_FOUND);
        } else {
            return next(e);
        }
    }
};

const buildError = (res: Response, errorMessage: string): void => {
    const companyNumberErrorData: GovUkErrorData = createGovUkErrorData(
        errorMessage,
        "#company-number",
        true,
        "");
    return res.render(templatePaths.COMPANY_NUMBER, {
        companyNumberErr: companyNumberErrorData,
        errorList: [companyNumberErrorData],
        templateName: templatePaths.COMPANY_NUMBER,
    });
};

export default [route];
