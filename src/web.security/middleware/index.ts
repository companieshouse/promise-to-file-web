import {NextFunction, Request, Response} from "express";
import {COOKIE_NAME, OAUTH2_AUTH_URI, OAUTH2_CLIENT_ID,
  OAUTH2_REDIRECT_URI} from "../../properties";
import * as redisService from "../../services/redis.service";
import * as keys from "../../session/keys";
import logger from "../../logger";
import {jweEncodeWithNonce, generateNonce} from "../jwt.encryption";

const OAUTH_SCOPE_PREFIX = "https://api.companieshouse.gov.uk/company/";
const COMPANY_NUMBER_KEY = "company_number";

export default async (req: Request, res: Response, next: NextFunction) => {
  // Get CompanyNumber from URI
  const companyNumber = getCompanyFromPath(req.originalUrl);
  if (companyNumber === "") {
    return next(new Error("No Company Number"));
  }

  const cookieId = req.cookies[COOKIE_NAME];
  if (cookieId) {
    req.chSession = await redisService.loadSession(cookieId);
    const signInInfo = req.chSession.getSignedInInfo();
    if (isAuthorisedForCompany(signInInfo, companyNumber)) {
        logger.info("User is authenticated for %s", companyNumber);
        return next();
    } else {
      return res.redirect(await getAuthRedirectUri(req, companyNumber));
    }
  } else {
    // TODO: Process no session
    return next(new Error("No session present for company auth filter"));
  }
};

function getCompanyFromPath(path: string): string {
  const regexPattern = "/company/([0-9a-zA-Z]{8})/";

  const found = path.match(regexPattern);
  if (found) {
    return found[1];
  } else {
    return "";
  }
}

function isAuthorisedForCompany(signInInfo: string, companyNumber: string): boolean {
  return signInInfo[COMPANY_NUMBER_KEY] === companyNumber;
}

async function getAuthRedirectUri(req: Request, companyNumber?: string): Promise<string> {
  const originalUrl = req.originalUrl;

  let scope = "";

  if (companyNumber != null) {
    scope = OAUTH_SCOPE_PREFIX + companyNumber;
  }

  const session = req.chSession;
  const nonce = generateNonce();
  session.data[keys.NONCE] = nonce;
  redisService.saveSession(session);

  return await createAuthUri(originalUrl, nonce, scope);
}

async function createAuthUri(originalUri: string, nonce: string, scope?: string): Promise<string> {
  let authUri = "";
  authUri = authUri.concat(OAUTH2_AUTH_URI, "?",
    "client_id=", OAUTH2_CLIENT_ID,
    "&redirect_uri=", OAUTH2_REDIRECT_URI,
    "&response_type=code");

  if (scope != null) {
    authUri = authUri.concat("&scope=", scope);
  }

  authUri = authUri.concat("&state=", await jweEncodeWithNonce(originalUri, nonce, "content"));
  return authUri;
}
