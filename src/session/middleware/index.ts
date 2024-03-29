import { NextFunction, Request, Response } from "express";
import logger from "../../logger";
import { COOKIE_NAME } from "../../properties";
import * as redisService from "../../services/redis.service";
import Session from "../session";

/**
 * Adds chSession property to Request interface.
 */
declare global {
  namespace Express {
    interface Request {
      chSession: Session;
    }
  }
}

export default async (req: Request, res: Response, next: NextFunction) => {
    const cookieId = req.cookies[COOKIE_NAME];

    if (cookieId) {
        logger.info("cookie found, loading session from redis: " + cookieId);
        req.chSession = await redisService.loadSession(cookieId);
    } else {
        logger.info("No cookie found, using blank session");
        req.chSession = await redisService.loadSession("");
    }
    next();
};
