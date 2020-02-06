import {NextFunction, Request, Response} from "express";
import logger from "../../../logger";
import {COOKIE_NAME, OAUTH2_AUTH_URI, OAUTH2_CLIENT_ID,
  OAUTH2_REDIRECT_URI} from "../../../properties";
import {loadSession, saveSession} from "../../../services/redis.service";
import {COMPANY_NUMBER, NONCE} from "../../../session/keys";
import {generateNonce, jweEncodeWithNonce} from "../jwt.encryption";

const OAUTH_SCOPE_PREFIX = "https://api.companieshouse.gov.uk/company/";

export default async (req: Request, res: Response, next: NextFunction) => {
  // Get CompanyNumber from URI
  const companyNumber = getCompanyNumberFromPath(req.originalUrl);
  if (companyNumber === "") {
    return next(new Error("No Company Number in URL"));
  }

  const cookieId = req.cookies[COOKIE_NAME];
  if (cookieId) {
    req.chSession = await loadSession(cookieId);
    const signInInfo = req.chSession.getSignedInInfo();
    if (isAuthorisedForCompany(signInInfo, companyNumber)) {
      logger.info("User is authenticated for %s", companyNumber);
      return next();
    } else {
      logger.info("User is not authenticated for %s, redirecting", companyNumber);
      return res.redirect(await getAuthRedirectUri(req, companyNumber));
    }
  } else {
    return next(new Error("No session present for company auth filter"));
  }
};

function getCompanyNumberFromPath(path: string): string {
  const regexPattern = "/company/([0-9a-zA-Z]{8})/";

  const found = path.match(regexPattern);
  if (found) {
    return found[1];
  } else {
    return "";
  }
}

function isAuthorisedForCompany(signInInfo: string, companyNumber: string): boolean {
  return signInInfo[COMPANY_NUMBER] === companyNumber;
}

async function getAuthRedirectUri(req: Request, companyNumber?: string): Promise<string> {
  const originalUrl = req.originalUrl;

  let scope = "";

  if (companyNumber != null) {
    scope = OAUTH_SCOPE_PREFIX + companyNumber;
  }

  const session = req.chSession;
  const nonce = generateNonce();
  session.data[NONCE] = nonce;
  await saveSession(session);

  return await createAuthUri(originalUrl, nonce, scope);
}

async function createAuthUri(originalUri: string, nonce: string, scope?: string): Promise<string> {
  let authUri = OAUTH2_AUTH_URI.concat("?",
    "client_id=", OAUTH2_CLIENT_ID,
    "&redirect_uri=", OAUTH2_REDIRECT_URI,
    "&response_type=code");

  if (scope != null) {
    authUri = authUri.concat("&scope=", scope);
  }

  authUri = authUri.concat("&state=", await jweEncodeWithNonce(originalUri, nonce, "content"));
  return authUri;
}
