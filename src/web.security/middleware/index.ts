import {NextFunction, Request, Response} from "express";
import {COOKIE_NAME, OAUTH2_AUTH_URI, OAUTH2_CLIENT_ID, OAUTH2_REDIRECT_URI} from "../../properties";
import * as redisService from "../../services/redis.service";
import * as createError from "http-errors";
import * as keys from "../../session/keys";
import * as jose from "node-jose";

const OAUTH_SCOPE_PREFIX = "https://api.companieshouse.gov.uk/company/";

export default async (req: Request, res: Response, next: NextFunction) => {
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
    //console.log(signInInfo);
    //console.log(req.chSession.data);
    if(isAuthorisedForCompany(signInInfo, companyNumber)) {
      return;
    } else {
      let tmp = redirectForAuth(req, res, companyNumber);
      return res.redirect(tmp);
    }
  } else {
    //TODO: Process no session
    console.log(5);
  }

  next();
};

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

function redirectForAuth(req: Request, res: Response, companyNumber?: string): string {
  const originalUrl = req.originalUrl;
  const queryString = req.query;
  console.log(originalUrl + " + " + queryString);
  //const originalUri = originalUrl + "?" + queryString;

  let scope = "";

  if(companyNumber != null) {
    scope = OAUTH_SCOPE_PREFIX + companyNumber;
  }

  const session = req.chSession;
  const nonce = "nonce";
  session.data[keys.NONCE] = nonce;
  console.log(session.data);
  //const nonceSession = redisService.saveSession(session);

  return createAuthUri(originalUrl, nonce, scope);

  //res.redirect(redirectUri);
}

function createAuthUri(originalUri: string, nonce: string, scope?: string): string {
  let authUri = "";
  authUri = authUri.concat(OAUTH2_AUTH_URI, "?", "client_id=", OAUTH2_CLIENT_ID, "&redirect_uri=", OAUTH2_REDIRECT_URI, "&response_type=code");

  if(scope != null) {
    authUri = authUri.concat("&scope=", scope);
    //authUri.concat("&scope=");
    //authUri.concat(scope);
  }

  authUri = authUri.concat("&state=", jweEncodeWithNonce(originalUri, nonce, "content"));
  //authUri.concat("&state=");
  //authUri.concat(jweEncodeWithNonce(originalUri, nonce, "content"));

  console.log("AUTH URI: " + authUri);
  return authUri;
}

function jweEncodeWithNonce(returnUri: string, nonce: string, attributeName: string): string {
  jose.JWE.createEncrypt()
  return "bleh";
}