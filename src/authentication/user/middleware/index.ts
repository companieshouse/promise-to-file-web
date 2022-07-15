import { NextFunction, Request, Response } from "express";
import logger from "../../../logger";
import * as pageURLs from "../../../model/page.urls";
import { getWhitelistedReturnToURL } from "../../../utils/request.utils";

export default (req: Request, res: Response, next: NextFunction) => {
  const referringPageURL = req.header("Referer") as string;

  logger.debug("Check if user has referer");
  if (referringPageURL === undefined) {
    logger.debug("User has no referer - redirecting to index");
    return res.redirect(pageURLs.COMPANY_REQUIRED);
  }

  logger.debug("Check if user is signed in");
  if (!req.chSession.isSignedIn()) {

    logger.debug("User not signed in");

    let returnToUrl: string = pageURLs.COMPANY_REQUIRED;

    // if user is coming from start page
    if (referringPageURL.endsWith(pageURLs.COMPANY_REQUIRED)) {
      returnToUrl = req.originalUrl;
    }

    logger.debug("User not signed in - redirecting to login screen");
    return res.redirect("/signin?return_to=" + getWhitelistedReturnToURL(returnToUrl));
  }

  next();
};
