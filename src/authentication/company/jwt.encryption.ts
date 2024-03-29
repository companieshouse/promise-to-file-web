import { randomBytes } from "crypto";
import { JWE, JWK } from "node-jose";
import { OAUTH2_REQUEST_KEY } from "../../properties";

/**
 * Implementation referenced from
 * https://github.com/companieshouse/web-security-java
 */

const PAYLOAD_NONCE_KEY = "nonce";

function generateNonce (): string {
    const bytes = randomBytes(5);
    const buffer = Buffer.from(bytes);
    return buffer.toString("base64");
}

async function jweEncodeWithNonce (returnUri: string, nonce: string, attributeName: string): Promise<string> {
    const payloadObject = {};
    payloadObject[PAYLOAD_NONCE_KEY] = nonce;
    payloadObject[attributeName] = returnUri;

    const payload = JSON.stringify(payloadObject);
    const decoded = Buffer.from(OAUTH2_REQUEST_KEY, "base64");

    const ks = await JWK.asKeyStore([{
        alg: "A128CBC-HS256",
        k: decoded,
        kid: "key",
        kty: "oct",
        use: "enc"
    }]);

    const key = await ks.get("key");

    return await JWE.createEncrypt({
        format: "compact"
    }, {
        header: {
            alg: "dir",
            enc: "A128CBC-HS256"
        },
        key
    }).update(payload).final();
}

export { jweEncodeWithNonce, generateNonce };
