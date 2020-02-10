import {NextFunction, Request, Response} from "express";
import {check, validationResult} from "express-validator/check";
import {COMPANY_REQUIRED_NOT_SELECTED} from "../model/error.messages";
import {createGovUkErrorData, GovUkErrorData} from "../model/govuk.error.data";
import {STILL_REQUIRED} from "../model/template.paths";
import {ValidationError} from "../model/validation.error";
import {getPromiseToFileSessionValue} from "../services/session.service";
import {COMPANY_PROFILE} from "../session/keys";

const validators = [
  check("continuedIllness").not().isEmpty().withMessage(COMPANY_REQUIRED_NOT_SELECTED),
];

export const getRoute = async (req: Request, res: Response, next: NextFunction): Promise<void> => {

  const companyName: string = getPromiseToFileSessionValue(req.chSession, COMPANY_PROFILE).companyName;

  return res.render(STILL_REQUIRED, {
    companyName,
    templateName: STILL_REQUIRED,
  });
};

const postRoute = async (req: Request, res: Response, next: NextFunction): Promise<void> => {

  const errors = validationResult(req);
  const companyName: string = getPromiseToFileSessionValue(req.chSession, COMPANY_PROFILE).companyName;

  // render errors in the view
  if (!errors.isEmpty()) {
    const errorText = errors.array()
      .map((err: ValidationError) => err.msg)
      .pop() as string;

    return renderPageWithError(res, errorText, companyName);
  } else {
    return res.render(STILL_REQUIRED, {
      companyName,
      templateName: STILL_REQUIRED,
    });
  }
};

const renderPageWithError = (res: Response, errorMessage: string, companyName: string): void => {
  const stillRequiredErrorData: GovUkErrorData = createGovUkErrorData(
    errorMessage,
    "#still-required",
    true,
    "");
  return res.render(STILL_REQUIRED, {
    companyName,
    stillRequiredError: stillRequiredErrorData,
    errorList: [stillRequiredErrorData],
    templateName: STILL_REQUIRED,
  });
};

export default [...validators, postRoute];
