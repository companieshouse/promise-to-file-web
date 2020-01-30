import * as cookieParser from "cookie-parser";
import * as express from "express";
import * as nunjucks from "nunjucks";
import * as path from "path";
import * as createError from "http-errors";
import {appRouter} from "./routes/routes";
import {ERROR_SUMMARY_TITLE} from "./model/error.messages";
import * as pageURLs from "./model/page.urls";
import chSessionLoader from "./session/middleware/ch_session";
import ptfSessionLoader from "./session/middleware/ptf_session";
import {PIWIK_SITE_ID, PIWIK_URL} from "./properties";
import authenticate from "./authentication/middleware/index";
import logger from "./logger";
import httpLogger from "./http.logger";

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

env.addGlobal("CDN_URL", process.env.CDN_HOST);

env.addGlobal("ERROR_SUMMARY_TITLE", ERROR_SUMMARY_TITLE);
env.addGlobal("PIWIK_URL", PIWIK_URL);
env.addGlobal("PIWIK_SITE_ID", PIWIK_SITE_ID);

app.enable("trust proxy");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(chSessionLoader);
app.use(ptfSessionLoader);

app.use(`${pageURLs.PROMISE_TO_FILE}/*`, authenticate);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "html");

app.use(httpLogger);

app.use(express.static(path.join(__dirname, "public")));

app.use(pageURLs.PROMISE_TO_FILE, appRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {

  logger.error("An error has occured. Re-routing to the error screen - " + err.stack);

  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

export default app;
