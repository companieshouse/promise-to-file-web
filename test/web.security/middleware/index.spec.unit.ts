import * as security from "../../../src/web.security/middleware/index";
import {OAUTH2_REQUEST_KEY} from "../../../src/properties";
import * as jose from "node-jose";

describe("Web Security tests", () => {

  it("Assert JWE encoding is performed correctly with URI content", async () => {

    const decodedKey = Buffer.from(OAUTH2_REQUEST_KEY, "base64");

    const ks = await jose.JWK.asKeyStore([{
      kid: 'key',
      kty: 'oct',
      k: decodedKey,
      alg: 'A128CBC-HS256',
      use: 'enc'
    }]);

    const jwe = await security.jweEncodeWithNonce("http://accounts.companieshouse.gov.uk/test", "1234567", "content");

    const tmp = await jose.JWE.createDecrypt(ks.getKey('key').decrypt(jwe)).then(djwt => {
      console.log(JSON.stringify(djwt, null, "    "));
    });

    expec
    console.log(tmp);
  });
});