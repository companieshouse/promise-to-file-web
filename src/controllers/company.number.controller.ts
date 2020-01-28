import {NextFunction, Request, Response} from "express";
import {check, validationResult} from "express-validator/check";
import * as errorMessages from "../model/error.messages";
import {createGovUkErrorData, GovUkErrorData} from "../model/govuk.error.data";
import * as templatePaths from "../model/template.paths";
import {ValidationError} from "../model/validation.error";
import logger from "../logger";
import * as sessionService from "../services/session.service";
import * as pageURLs from "../model/page.urls";
import { PTFCompanyProfile } from "../model/company.profile";
import { getCompanyProfile } from "../client/apiclient";
import * as keys from "../session/keys";

// validator middleware that checks for an empty or too long input
const preValidators = [
  check("companyNumber").blacklist(" ").escape().not().isEmpty().withMessage(errorMessages.NO_COMPANY_NUMBER_SUPPLIED),
  check("companyNumber").blacklist(" ").escape().isLength({max: 8}).withMessage(errorMessages.COMPANY_NUMBER_TOO_LONG),
];

// pads company number to 8 digits with 0's and removes whitespace
const padCompanyNumber = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  let companyNumber: string = req.body.companyNumber;
  if (/^([a-zA-Z]{2}?)/gm.test(companyNumber)) {
    const leadingLetters = companyNumber.substring(0, 2);
    let trailingChars = companyNumber.substring(2, companyNumber.length);
    trailingChars = trailingChars.padStart(6, "0");
    companyNumber = leadingLetters + trailingChars;
  } else {
      companyNumber = companyNumber.padStart(8, "0");
    }
  req.body.companyNumber = companyNumber;
  return next();
};

// validator middleware that checks for invalid characters in the input
const postValidators = [
  check("companyNumber").blacklist(" ").escape().custom((value: string) => {
    if (!/^([a-zA-Z]{2})?[0-9]{6,8}$/gm.test(value)) {
      throw new Error(errorMessages.INVALID_COMPANY_NUMBER);
    }
    return true;
  }),
];

const route = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const errors = validationResult(req);

  // render errors in the view
  if (!errors.isEmpty()) {
    const errorText = errors.array({ onlyFirstError: true })
                            .map((err: ValidationError) => err.msg)
                            .pop() as string;
    const companyNumberErrorData: GovUkErrorData = createGovUkErrorData(errorText, "#company-number", true, "");

    return res.render(templatePaths.COMPANY_NUMBER, {
      companyNumberErr: companyNumberErrorData,
      errorList: [companyNumberErrorData],
      templateName: templatePaths.COMPANY_NUMBER,
    });
  }

  const companyNumber: string = req.body.companyNumber;
  try {
    logger.info(`Retrieving company profile for company number ${companyNumber}`);
    const token: string = req.chSession.accessToken() as string;

    // TODO: Place this call somewhere more global so that it not called on check company as well
    const company: PTFCompanyProfile = await getCompanyProfile(companyNumber, token);

    const existing = req.chSession.data[keys.PTF_SESSION];
    if (existing) {
      await sessionService.updatePTFSessionValue(req.chSession,
          keys.COMPANY_NUMBER_IN_CONTEXT, company.companyNumber);
    } else  {
      await sessionService.createPromiseToFileSession(req.chSession, company.companyNumber);
    }

    return res.redirect(pageURLs.PTF_CHECK_COMPANY);
  } catch (e) {
    logger.error(`Error fetching company profile for company number ${companyNumber}`, e);
    if (e.status === 404) {
      buildError(res, errorMessages.COMPANY_NOT_FOUND);
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

export default [...preValidators, padCompanyNumber, ...postValidators, route];
