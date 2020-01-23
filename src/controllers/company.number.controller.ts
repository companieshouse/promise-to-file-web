import {NextFunction, Request, Response} from "express";
import {check, validationResult} from "express-validator/check";
import * as errorMessages from "../model/error.messages";
import {createGovUkErrorData, GovUkErrorData} from "../model/govuk.error.data";
import * as templatePaths from "../model/template.paths";
import {ValidationError} from "../model/validation.error";



// validator middleware
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

// validator middleware
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
