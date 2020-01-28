import { NextFunction, Request, Response } from "express";
import logger from "../../logger";
import * as pageURLs from "../../model/page.urls";

export default (req: Request, res: Response, next: NextFunction) => {

  logger.debug("Check if user is authenticated");

  if (!req.chSession.isSignedIn()) {

    logger.debug("User not authenticated");

    let returnToUrl: string = pageURLs.PROMISE_TO_FILE;

    const referringPageURL = req.header("Referer") as string;

    // Redirect the user to to the start screen if they weren't already on the PTF journey
    if (referringPageURL === undefined) {
      logger.debug("User not authenticated and referrer undefined - redirecting to index");
      return res.redirect(pageURLs.PROMISE_TO_FILE);
    }

    if (referringPageURL.endsWith(pageURLs.PROMISE_TO_FILE)) {
      returnToUrl = req.originalUrl;
    }

    logger.debug("User not authenticated - redirecting to login screen");
    return res.redirect("/signin?return_to=" + returnToUrl);
  }

  next();
};
