import Session from "../session/session";
import { saveSession } from "./redis.service";
import * as keys from "../session/keys";

/**
 * Creates a new Promise To File session.
 * This will override an existing Promise To File session
 * @param chSession
 */
const createPromiseToFileSession = async (chSession: Session): Promise<void> => {
  chSession.appendData(keys.PTF_SESSION, {});
  await saveSession(chSession);
};

/**
 * Updates a field in the Promise To File session specified by the key argument.
 * @param chSession
 * @param key
 * @param value
 */
const updatePromiseToFileSessionValue = async (chSession: Session, key: string, value: any): Promise<void> => {
  chSession.data[keys.PTF_SESSION][key] = value;
  await saveSession(chSession);
};

/**
 * Returns a field from the Promise To File session specified by the key argument.
 * @param chSession
 * @param key
 */
const getPromiseToFileSessionValue = (chSession: Session, key: string): any => {
  return chSession.data[keys.PTF_SESSION][key];
};

export { createPromiseToFileSession, getPromiseToFileSessionValue, updatePromiseToFileSessionValue };
