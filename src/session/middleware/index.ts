import Session from "../session";
import {NextFunction, Request, Response} from "express";
import {COOKIE_NAME, SESSION_CREATE} from "../../properties";
import * as redisService from "../../services/redis.service";
import logger from "../../logger";
import activeFeature from "../../feature.flag";

declare global {
  namespace Express {
    interface Request {
      chSession: Session;
    }
  }
}

export default async (req: Request, res: Response, next: NextFunction) => {
  const cookieId = req.cookies[COOKIE_NAME];
  // if there is no cookie, we need to create a new session
  if (!cookieId && activeFeature(SESSION_CREATE)) {
    logger.info("No cookie found, creating new session");
    const session = Session.newInstance();
    session.setClientSignature(req.get("user-agent") || "", req.ip);
    await redisService.saveSession(session);

    req.chSession = session;
    res.cookie(COOKIE_NAME, session.cookieId, {path: "/"});
  } else {
    logger.info("cookie found, loading session from redis: " + cookieId);
    req.chSession = await redisService.loadSession(cookieId);
  }

  next();
};
