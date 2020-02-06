import * as jwt from "../../../src/authentication/company/jwt.encryption";
import {OAUTH2_REQUEST_KEY} from "../../../src/properties";
import * as jose from "node-jose";
import {generateNonce} from "../../../src/authentication/company/jwt.encryption";

jest.mock("../../../src/session/store/redis.store", () => import("../../mocks/redis.store.mock.factory"));

const NONCE = "123bh*";
const RETURN_URI = "https://test.uri.gov.uk/testing";

describe("Web Security tests", () => {

  it("Assert JWE encoding is performed correctly with URI content", async () => {

    const decodedKey = Buffer.from(OAUTH2_REQUEST_KEY, "base64");

    const ks = await jose.JWK.asKeyStore([{
      alg: "A128CBC-HS256",
      k: decodedKey,
      kid: "key",
      kty: "oct",
      use: "enc",
    }]);

    const jwe = await jwt.jweEncodeWithNonce(RETURN_URI, NONCE, "content");

    await jose.JWE.createDecrypt(ks).
      decrypt(jwe).
      then((result) => {
        const decodedPayload = JSON.parse(Buffer.from(result.plaintext).toString());
        const decodedNonce = decodedPayload.nonce;
        const decodedContent = decodedPayload.content;
        expect(decodedNonce).toEqual(NONCE);
        expect(decodedContent).toEqual(RETURN_URI);
    });
  });

  it("Assert a valid nonce is created", () => {
    const nonce = generateNonce();
    expect(nonce.length).toEqual(8);
  });
});
