import * as cookieParser from "cookie-parser";
import * as express from "express";
import * as createError from "http-errors";
import * as nunjucks from "nunjucks";
import * as path from "path";
import companyAuthenticate from "./authentication/company/middleware/index";
import authenticate from "./authentication/user/middleware/index";
import { checkServiceAvailability } from "./availability/middleware/service.availability";
import healthcheckController from "./controllers/healthcheck.controller";
import httpLogger from "./http.logger";
import logger from "./logger";
import { ERROR_SUMMARY_TITLE } from "./model/error.messages";
import * as pageURLs from "./model/page.urls";
import { PIWIK_SITE_ID, PIWIK_URL, CACHE_SERVER, COOKIE_NAME, COOKIE_SECRET, COOKIE_DOMAIN, DEFAULT_SESSION_EXPIRATION } from "./properties";
import { appRouter } from "./routes/routes";
import { createPromiseToFileSession } from "./services/session.service";
import sessionMiddleware from "./session/middleware";
import { createCsrfProtectionMiddleware, csrfErrorHandler } from "./csrf.middleware";
import ptfSessionLoader from "./session/middleware/ptf.session";
import Redis from 'ioredis';
import { SessionStore, SessionMiddleware } from '@companieshouse/node-session-handler';

const redis = new Redis(CACHE_SERVER);
const sessionStore = new SessionStore(redis);
const csrfProtectionMiddleware = createCsrfProtectionMiddleware(sessionStore);

const app = express();

// view engine setup
const env = nunjucks.configure([
    "views",
    "node_modules/govuk-frontend/",
    "node_modules/govuk-frontend/components/",
    "node_modules/@companieshouse/"
], {
    autoescape: true,
    express: app
});

logger.debug("Setting up environment variables");
env.addGlobal("CHS_URL", process.env.CHS_URL);
env.addGlobal("assetPath", process.env.CDN_HOST);
env.addGlobal("ERROR_SUMMARY_TITLE", ERROR_SUMMARY_TITLE);
env.addGlobal("PIWIK_URL", PIWIK_URL);
env.addGlobal("PIWIK_SITE_ID", PIWIK_SITE_ID);

app.enable("trust proxy");

logger.debug("Setting up middleware");
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// check if we should show the service unavailable page
app.use(checkServiceAvailability);
app.use(cookieParser());

// Healthcheck does not require session or authenticate.
// Hence requires to be placed higher than sessionMiddleware and authenticate
// in the order of  ".use" reflect in order of precedence of execution
app.use(`${pageURLs.HEALTHCHECK}`, healthcheckController);

app.use(sessionMiddleware);
const cookieConfig = {
  cookieName: COOKIE_NAME,
  cookieSecret: COOKIE_SECRET,
  cookieDomain: COOKIE_DOMAIN,
  cookieTimeToLiveInSeconds: parseInt(DEFAULT_SESSION_EXPIRATION, 10)
};
app.use(SessionMiddleware(cookieConfig, sessionStore));
app.use(csrfProtectionMiddleware);
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
app.use(async (err, req, res, next) => {

    logger.error("An error has occurred. Re-routing to the error screen - " + err.stack);

    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : { };

    // Any old PTF session data will be discarded as a result of this call to create a new PTF session object. The
    // new, empty PTF session will be utilised if the user decides to start a new PTF journey
    await createPromiseToFileSession(req.chSession);

    // render the error page
    res.status(err.status || 500);
    res.render("error");
});

app.use(csrfErrorHandler);

logger.info("Company Required service started");

export default app;
