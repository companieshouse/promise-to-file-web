import { NextFunction, Request, Response, Router } from "express";
import checkCompanyRoute from "../controllers/check.company.controller";
import companyNumberRoute from "../controllers/company.number.controller";
import confirmationRoute from "../controllers/confirmation.controller";
import stillRequiredPostRoute, { getRoute as stillRequiredGetRoute } from "../controllers/still.required.controller";
import * as pageURLs from "../model/page.urls";
import { Templates } from "../model/template.paths";

const router: Router = Router();

/**
 * Simply renders a view template.
 *
 * @param template the template name
 */
const renderTemplate = (template: string) => (req: Request, res: Response, next: NextFunction) => {
  return res.render(template, { templateName: template });
};

router.get(pageURLs.ROOT, renderTemplate(Templates.INDEX));

router.get(pageURLs.COMPANY_NUMBER, renderTemplate(Templates.COMPANY_NUMBER));
router.post(pageURLs.COMPANY_NUMBER, ...companyNumberRoute);

router.get(pageURLs.CHECK_COMPANY, checkCompanyRoute);

router.get(pageURLs.STILL_REQUIRED, stillRequiredGetRoute);
router.post(pageURLs.STILL_REQUIRED, stillRequiredPostRoute);

router.get(pageURLs.CONFIRMATION, ...confirmationRoute);

export const appRouter = router;
