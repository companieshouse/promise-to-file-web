import { NextFunction, Request, Response } from "express";
import * as keys from "../keys";
import * as sessionService from "../../services/session.service";

/**
 * Adds a "Promise to File" session object.
 * Requires req.chSession.data to be present.
 * If not present then it will error, rather than check for existence
 * and continue on silently, as these objects need to be present
 * for the app to work correctly.
 * @param req
 * @param res
 * @param next
 */
export default async (req: Request, res: Response, next: NextFunction) => {
  if (!req.chSession.data[keys.PTF_SESSION]) {
    await sessionService.createPromiseToFileSession(req.chSession);
  }
  next();
};
