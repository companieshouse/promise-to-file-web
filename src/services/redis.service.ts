import Session from "../session/session";
import redisStore from "../session/store/redis.store";

/**
 * Saves a session to redis.
 * @param chSession
 */
const saveSession = async (chSession: Session): Promise<void> => {
await redisStore.save(chSession);
};

/**
 * Loads a session from the redis store.
 * @param cookieId
 */
const loadSession = async (cookieId: string): Promise<Session> => {
const session: Session = Session.newWithCookieId(cookieId);
session.data = await redisStore.getData(session.sessionKey());
return session;
};

export {saveSession, loadSession};
