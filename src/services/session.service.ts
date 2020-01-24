import Session from "../session/session";
import { IPromiseToFileSession } from "session/types";
import { saveSession } from "./redis.service";
import * as keys from "../session/keys";

/**
 * Creates a new ptf session and adds a company to the context.
 * This will override any ptf session that is already in redis.
 * @param chSession
 * @param companyNumber
 */
const createPromiseToFileSession = async (
    chSession: Session, companyNumber: string): Promise<IPromiseToFileSession> => {
    const ptfSession: IPromiseToFileSession = {
        company_in_context: companyNumber,
        ptf_requests: [],
    };
    chSession.appendData(keys.PTF_SESSION, ptfSession);
    await saveSession(chSession);
    return ptfSession;
};

export { createPromiseToFileSession };
