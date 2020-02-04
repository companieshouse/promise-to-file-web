import {NextFunction, Request, Response, Router} from "express";
import companyNumberRoute from "../controllers/company.number.controller";
import checkCompanyRoute from "../controllers/check.company.controller";
import * as pageURLs from "../model/page.urls";
import * as templatePaths from "../model/template.paths";

const router: Router = Router();

/**
 * Simply renders a view template.
 *
 * @param template the template name
 */
const renderTemplate = (template: string) => (req: Request, res: Response, next: NextFunction) => {
  return res.render(template, {templateName: template});
};

router.get(pageURLs.ROOT, renderTemplate(templatePaths.INDEX));

router.get(pageURLs.COMPANY_NUMBER, renderTemplate(templatePaths.COMPANY_NUMBER));
router.post(pageURLs.COMPANY_NUMBER, ...companyNumberRoute);

router.get(pageURLs.CHECK_COMPANY, checkCompanyRoute);

export const appRouter = router;
