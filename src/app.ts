import * as cookieParser from "cookie-parser";
import * as express from "express";
import * as createError from "http-errors";
import * as nunjucks from "nunjucks";
import * as path from "path";
import companyAuthenticate from "./authentication/company/middleware/index";
import authenticate from "./authentication/user/middleware/index";
import { checkServiceAvailability } from "./availability/middleware/service.availability";
import httpLogger from "./http.logger";
import logger from "./logger";
import { ERROR_SUMMARY_TITLE } from "./model/error.messages";
import * as pageURLs from "./model/page.urls";
import { PIWIK_SITE_ID, PIWIK_URL } from "./properties";
import { appRouter } from "./routes/routes";
import sessionMiddleware from "./session/middleware";
import ptfSessionLoader from "./session/middleware/ptf.session";

const app = express();

// view engine setup
const env = nunjucks.configure([
  "views",
  "node_modules/govuk-frontend/",
  "node_modules/govuk-frontend/components/",
], {
  autoescape: true,
  express: app,
});

logger.debug("Setting up environment variables");
env.addGlobal("CDN_URL", process.env.CDN_HOST);

env.addGlobal("ERROR_SUMMARY_TITLE", ERROR_SUMMARY_TITLE);
env.addGlobal("PIWIK_URL", PIWIK_URL);
env.addGlobal("PIWIK_SITE_ID", PIWIK_SITE_ID);

app.enable("trust proxy");

logger.debug("Setting up middleware");
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// check if we should show the service unavailable page
app.use(`${pageURLs.COMPANY_REQUIRED}`, checkServiceAvailability);
app.use(cookieParser());
app.use(sessionMiddleware);
app.use(ptfSessionLoader);

app.use(`${pageURLs.COMPANY_REQUIRED}/*`, authenticate);
app.use(`${pageURLs.COMPANY_REQUIRED}${pageURLs.COMPANY_AUTH_PROTECTED_ROUTE}*`, companyAuthenticate);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "html");

app.use(httpLogger);

app.use(express.static(path.join(__dirname, "public")));

app.use(pageURLs.COMPANY_REQUIRED, appRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {

  logger.error("An error has occurred. Re-routing to the error screen - " + err.stack);

  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : { };

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

logger.info("Company Required service started");

export default app;
