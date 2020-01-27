import {NextFunction, Request, Response} from "express";
import {COOKIE_NAME} from "../../properties";
import * as redisService from "../../services/redis.service";
import * as createError from "http-errors";

export default async (req: Request, res: Response, next: NextFunction) => {
  const i = await CompanyAuthFilter(req)
    .catch((e) => {
      return next(createError(404));
    });
  console.log(6);

  next();
};

async function CompanyAuthFilter(req: Request, res: Response) {
  const cookieId = req.cookies[COOKIE_NAME];

  if(cookieId) {
    req.chSession = await redisService.loadSession(cookieId);
    //Get CompanyNumber from URI
    console.log(req.path);
    const companyNumber = getCompanyFromPath(req.path);
    console.log(companyNumber);
    if(companyNumber == "") {
      throw new Error("No Company Number");
    }
    const signInInfo = req.chSession.getSignedInInfo();
    console.log("Sign in info");
    console.log(signInInfo);
    console.log(req.chSession.data);
    if(isAuthorisedForCompany(signInInfo, companyNumber)) {
      return;
    } else {
      redirectForAuth(req, res, companyNumber);
    }
  } else {
    //TODO: Process no session
    console.log(5);
  }
}

function getCompanyFromPath(path: string): string{
  const regexPattern = "/company/([0-9a-zA-Z]{8})/";

  const found = path.match(regexPattern);
  console.log(found);
  if(found) {
    return found[1];
  }else {
    return "";
  }
}

function isAuthorisedForCompany(signInInfo: string, companyNumber: string): boolean {
  console.log(signInInfo["company_number"]);
  console.log(signInInfo["company_number"] === companyNumber);

  return signInInfo["company_number"] === companyNumber;
}

function redirectForAuth(req: Request, res: Response, companyNumber: string) {
  const originalUrl = req.originalUrl;
  const queryString 
}