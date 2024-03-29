import * as crypto from "crypto";
import { COOKIE_SECRET, DEFAULT_SESSION_EXPIRATION, INTEGER_PARSE_BASE } from "../properties";
import * as keys from "./keys";
import { unmarshalSignInInfo } from "./store/util";
import { IMap } from "./types";

export default class Session {
    get cookieId (): string {
        return this._cookieId;
    }

    set data (data: IMap<any>) {
        this._data = data;
    }

    get data (): IMap<any> {
        return this._data;
    }

    /**
   * Static factory to create a new session instance using the default store
   * (redis).
   */
    public static newInstance (): Session {
        const session = new Session();
        const now = Math.floor((new Date()).getTime() / 1000);

        session.data = {
            [keys.ID]: session.sessionKey(),
            [keys.EXPIRES]: now + parseInt(DEFAULT_SESSION_EXPIRATION, INTEGER_PARSE_BASE),
            [keys.LAST_ACCESS]: now
        };
        return session;
    }

    /**
   * Static factory to create a new session instance when there is already a
   * cookie id.
   */
    public static newWithCookieId (cookieId: string): Session {
        return new Session(cookieId);
    }

    private static generateSignature (sessionKey: string): string {
        const hash = crypto.createHash("sha1");
        const data = hash.update(sessionKey + COOKIE_SECRET);
        const buff = data.digest();
        const sig = buff.toString("base64");
        return sig.substr(0, sig.indexOf("="));
    }

    private static generateSessionKey (): string {
        const bytes = crypto.randomBytes(21);
        return bytes.toString("base64");
    }

    private _cookieId: string;
    private _data: IMap<any>;

    private constructor (cookieId?: string) {
        if (!cookieId) {
            this.generateNewCookieId();
        } else {
            this._cookieId = cookieId;
        }
    }

    public sessionKey (): string {
    // First 28 represent the key the rest is the password
        return this._cookieId.substr(0, 28);
    }

    public setClientSignature (userAgent: string, clientIp: string) {
        const hash = crypto.createHash("sha1");
        const data = hash.update(userAgent + clientIp + COOKIE_SECRET);
        this.data[keys.CLIENT_SIG] = data.digest("hex");
    }

    public appendData (key: string, value: any): void {
        this.data[key] = value;
    }

    public isSignedIn (): boolean {
        const signInInfo = unmarshalSignInInfo(this._data);
        if (!signInInfo) {
            return false;
        }

        return signInInfo.signedIn as boolean;
    }

    public accessToken (): string | undefined {
        const signInInfo = unmarshalSignInInfo(this._data);
        if (signInInfo && signInInfo.accessToken && signInInfo.accessToken.token) {
            return signInInfo.accessToken.token;
        }
    }

    public getSignedInInfo (): string {
        return this.data[keys.SIGN_IN_INFO];
    }

    /**
   * Generates a new cookie id.
   */
    private generateNewCookieId () {
        const key = Session.generateSessionKey();
        this._cookieId = key + Session.generateSignature(key);
    }
}
