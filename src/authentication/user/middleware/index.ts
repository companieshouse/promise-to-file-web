import { NextFunction, Request, Response } from "express";
import logger from "../../../logger";
import * as pageURLs from "../../../model/page.urls";

export default (req: Request, res: Response, next: NextFunction) => {
  const referringPageURL = req.header("Referer") as string;

  if (referringPageURL === undefined) {
    return res.redirect(pageURLs.PROMISE_TO_FILE);
  }

  logger.debug("Check if user is authenticated");

  if (!req.chSession.isSignedIn()) {

    logger.debug("User not authenticated");

    let returnToUrl: string = pageURLs.PROMISE_TO_FILE;

    if (referringPageURL.endsWith(pageURLs.PROMISE_TO_FILE)) {
      returnToUrl = req.originalUrl;
    }

    logger.debug("User not authenticated - redirecting to login screen");
    return res.redirect("/signin?return_to=" + returnToUrl);
  }

  next();
};
