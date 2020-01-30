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
    company_number_in_context: companyNumber,
  };
  chSession.appendData(keys.PTF_SESSION, ptfSession);
  await saveSession(chSession);
  return ptfSession;
};

const updatePTFSessionValue = async (chSession: Session, key: string, value: any): Promise<void> => {
  const ptfSession = await chSession.data.ptf_session;
  ptfSession[key] = value;
  chSession.appendData(keys.PTF_SESSION, ptfSession);
  await saveSession(chSession);
};

/**
 * Returns the company number in context. That is the number of the
 * most recent company that was input in the company number screen.
 * @param chSession
 */
const getCompanyNumberInContext = (chSession: Session): string => {
  return chSession.data.ptf_session.company_number_in_context;
};

export { createPromiseToFileSession, getCompanyNumberInContext, updatePTFSessionValue };
