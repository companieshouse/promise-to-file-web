import { configure, getLogger } from "log4js";
import { LOG_LEVEL } from "./properties";

const logger = getLogger("promise-to-file-web");
logger.level = LOG_LEVEL;

configure({
  appenders: { extensions: { type: "console"} },
  categories: { default: { appenders: ["extensions"], level: logger.level } },
});

export default logger;
