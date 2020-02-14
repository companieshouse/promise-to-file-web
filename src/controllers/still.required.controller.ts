import {NextFunction, Request, Response} from "express";
import {check, validationResult} from "express-validator/check";
import {COMPANY_REQUIRED_NOT_SELECTED} from "../model/error.messages";
import {createGovUkErrorData, GovUkErrorData} from "../model/govuk.error.data";
import {APPEND_CONFIRMATION, PROMISE_TO_FILE} from "../model/page.urls";
import {STILL_REQUIRED} from "../model/template.paths";
import {ValidationError} from "../model/validation.error";
import {getPromiseToFileSessionValue, updatePromiseToFileSessionValue} from "../services/session.service";
import {COMPANY_PROFILE, IS_STILL_REQUIRED} from "../session/keys";
import Session from "../session/session";

const validators = [
  check("stillRequired").not().isEmpty().withMessage(COMPANY_REQUIRED_NOT_SELECTED),
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
    await addDecisionToSession(req.body.stillRequired, req.chSession);
    const companyNumber = getPromiseToFileSessionValue(req.chSession, COMPANY_PROFILE).companyNumber;
    const url = PROMISE_TO_FILE + "/company/" + companyNumber + APPEND_CONFIRMATION;
    return res.redirect(url);
  }
};

const addDecisionToSession = async (decision: string, session: Session): Promise<void> => {
  await updatePromiseToFileSessionValue(session,  IS_STILL_REQUIRED, decision);
};

const renderPageWithError = (res: Response, errorMessage: string, companyName: string): void => {
  const stillRequiredErrorData: GovUkErrorData = createGovUkErrorData(
    errorMessage,
    "#still-required",
    true,
    "");
  return res.render(STILL_REQUIRED, {
    companyName,
    errorList: [stillRequiredErrorData],
    stillRequiredError: stillRequiredErrorData,
    templateName: STILL_REQUIRED,
  });
};

export default [...validators, postRoute];
