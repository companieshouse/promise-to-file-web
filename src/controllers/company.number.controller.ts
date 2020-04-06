import { NextFunction, Request, Response } from "express";
import { check, validationResult } from "express-validator/check";
import { getCompanyProfile } from "../client/apiclient";
import logger from "../logger";
import { PTFCompanyProfile } from "../model/company.profile";
import { COMPANY_NOT_FOUND, COMPANY_NUMBER_TOO_LONG,
    INVALID_COMPANY_NUMBER, NO_COMPANY_NUMBER_SUPPLIED } from "../model/error.messages";
import { createGovUkErrorData, GovUkErrorData } from "../model/govuk.error.data";
import { COMPANY_REQUIRED_CHECK_COMPANY } from "../model/page.urls";
import { Templates } from "../model/template.paths";
import { ValidationError } from "../model/validation.error";
import { updatePromiseToFileSessionValue } from "../services/session.service";
import { COMPANY_PROFILE } from "../session/keys";

// validator middleware that checks for an empty or too long input
const preValidators = [
  check("companyNumber").blacklist(" ").escape().not().isEmpty().withMessage(NO_COMPANY_NUMBER_SUPPLIED),
  check("companyNumber").blacklist(" ").escape().isLength({max: 8}).withMessage(COMPANY_NUMBER_TOO_LONG),
];

// pads company number to 8 digits with 0's and removes whitespace
const padCompanyNumber = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  let companyNumber: string = req.body.companyNumber;
  if (/^([a-zA-Z]{1}?)/gm.test(companyNumber)) {
    companyNumber = formatCompanyNumber(companyNumber, 1, 7);
  } else if (/^([a-zA-Z]{2}?)/gm.test(companyNumber)) {
    companyNumber = formatCompanyNumber(companyNumber, 2, 6);
  } else {
    companyNumber = companyNumber.padStart(8, "0");
  }
  req.body.companyNumber = companyNumber;
  return next();
};

const formatCompanyNumber = (companyNumber: string, leadPoint: number, padStart: number): string  => {
  const leadingLetters = companyNumber.substring(0, leadPoint);
  let trailingChars = companyNumber.substring(leadPoint, companyNumber.length);
  trailingChars = trailingChars.padStart(padStart, "0");
  logger.debug("`n >>>>>>>>>>> TRAILING CHARS: " + trailingChars);
  return leadingLetters + trailingChars;
};

// validator middleware that checks for invalid characters in the input
const postValidators = [
  check("companyNumber").blacklist(" ").escape().custom((value: string) => {
    if (!/^([a-zA-Z]{1,2})?[0-9]{6,8}$/gm.test(value)) {
      throw new Error(INVALID_COMPANY_NUMBER);
    }
    return true;
  }),
];

/**
 * POST controller for company number screen
 * @param req
 * @param res
 * @param next
 */
const route = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  logger.debug("Attempt to retrieve and show the company details");

  const errors = validationResult(req);

  // render errors in the view
  if (!errors.isEmpty()) {
    const errorText = errors.array({ onlyFirstError: true })
                            .map((err: ValidationError) => err.msg)
                            .pop() as string;

    return buildError(res, errorText);
  }

  const companyNumber: string = req.body.companyNumber;

  try {
    logger.info("Retrieving company profile for company number ${companyNumber}");
    const token: string = req.chSession.accessToken() as string;
    const company: PTFCompanyProfile = await getCompanyProfile(companyNumber, token);

    await updatePromiseToFileSessionValue(req.chSession, COMPANY_PROFILE, company);

    return res.redirect(COMPANY_REQUIRED_CHECK_COMPANY);
  } catch (e) {
    logger.error("Error fetching company profile for company number ${companyNumber}", e);
    if (e.status === 404) {
      buildError(res, COMPANY_NOT_FOUND);
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
  return res.render(Templates.COMPANY_NUMBER, {
    companyNumberErr: companyNumberErrorData,
    errorList: [companyNumberErrorData],
    templateName: Templates.COMPANY_NUMBER,
  });
};

export default [...preValidators, padCompanyNumber, ...postValidators, route];
