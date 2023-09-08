import { NextFunction, Request, Response } from "express";
import activeFeature from "../../feature.flag";
import logger from "../../logger";
import { Templates } from "../../model/template.paths";

/**
 * Shows service unavailable page if config flag SHOW_SERVICE_UNAVAILABLE_PAGE=on
 */
export const checkServiceAvailability = (req: Request, res: Response, next: NextFunction) => {
    if (activeFeature(process.env.SHOW_SERVICE_UNAVAILABLE_PAGE)) {
        logger.info("-- SERVICE UNAVAILABLE -- To change set SHOW_SERVICE_UNAVAILABLE_PAGE=off in config");
        return res.render(Templates.SERVICE_UNAVAILABLE);
    }
    // feature flag SHOW_SERVICE_UNAVAILABLE_PAGE switched off - carry on as normal
    next();
};
