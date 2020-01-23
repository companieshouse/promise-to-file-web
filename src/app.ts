import * as cookieParser from "cookie-parser";
import * as express from "express";
import * as nunjucks from "nunjucks";
import * as path from "path";
import * as createError from "http-errors";
import * as logger from "morgan";

import {appRouter} from "./routes/routes";
import * as pageURLs from "./model/page.urls";
import sessionMiddleware from "./session/middleware";
import {PIWIK_SITE_ID, PIWIK_URL} from "./properties";

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

// TODO Configure the view engine for CHS - uncomment the following lines and change as appropriate

env.addGlobal("CDN_URL", process.env.CDN_HOST);

// env.addGlobal("ERROR_SUMMARY_TITLE", ERROR_SUMMARY_TITLE);
env.addGlobal("PIWIK_URL", PIWIK_URL);
env.addGlobal("PIWIK_SITE_ID", PIWIK_SITE_ID);

// app.enable("trust proxy");
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
// app.use(sessionMiddleware);
// app.use(`${pageURLs.EXTENSIONS}/*`, authenticate);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "html");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(sessionMiddleware);
app.use(express.static(path.join(__dirname, "public")));

app.use(pageURLs.PROMISE_TO_FILE, appRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

export default app;
