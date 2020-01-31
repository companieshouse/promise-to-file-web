import {NextFunction, Request, Response} from "express";
import {COOKIE_NAME, OAUTH2_AUTH_URI, OAUTH2_CLIENT_ID,
  OAUTH2_REDIRECT_URI, OAUTH2_REQUEST_KEY} from "../../properties";
import * as redisService from "../../services/redis.service";
import * as keys from "../../session/keys";
import * as jose from "node-jose";
import * as crypto from "crypto";

const OAUTH_SCOPE_PREFIX = "https://api.companieshouse.gov.uk/company/";

export default async (req: Request, res: Response, next: NextFunction) => {
  const cookieId = req.cookies[COOKIE_NAME];

  if (cookieId) {
    req.chSession = await redisService.loadSession(cookieId);
    // Get CompanyNumber from URI
    const companyNumber = getCompanyFromPath(req.path);
    if (companyNumber === "") {
      throw new Error("No Company Number");
    }
    const signInInfo = req.chSession.getSignedInInfo();
    if (isAuthorisedForCompany(signInInfo, companyNumber)) {
      next();
    } else {
      const tmp = await redirectForAuth(req, res, companyNumber);
      return res.redirect(tmp);
    }
  } else {
    // TODO: Process no session
  }

  next();
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
  // console.log(signInInfo.company_number);
  // console.log(signInInfo.company_number === companyNumber);

  return signInInfo["company_number"] === companyNumber;
}

async function redirectForAuth(req: Request, res: Response, companyNumber?: string): Promise<string> {
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
  authUri = authUri.concat(OAUTH2_AUTH_URI, "?", "client_id=", OAUTH2_CLIENT_ID, "&redirect_uri=", OAUTH2_REDIRECT_URI, "&response_type=code");

  if (scope != null) {
    authUri = authUri.concat("&scope=", scope);
  }

  authUri = authUri.concat("&state=", await jweEncodeWithNonce(originalUri, nonce, "content"));
  return authUri;
}

function generateNonce(): string {
  const bytes = crypto.randomBytes(5);
  const buffer = Buffer.from(bytes);
  return buffer.toString("base64");
}

async function jweEncodeWithNonce(returnUri: string, nonce: string, attributeName: string): Promise<string> {
  const payloadObject = {"nonce" : nonce, "content" : returnUri};
  // payloadObject[nonce] = nonce;
  // payloadObject[attributeName] = returnUri;

  const payload = JSON.stringify(payloadObject);
  const decoded = Buffer.from(OAUTH2_REQUEST_KEY, "base64");

  const ks = await jose.JWK.asKeyStore([{
    kid: "key",
    kty: "oct",
    k: decoded,
    alg: "A128CBC-HS256",
    use: "enc",
  }]);

  const key = await ks.get("key");

  return await jose.JWE.createEncrypt({
    format: "compact",
  }, {
    key,
    header: {
      enc: "A128CBC-HS256",
      alg: "dir",
    },
  }).update(payload).final();
}

export {jweEncodeWithNonce};
