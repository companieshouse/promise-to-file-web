import * as morganLogger from "morgan";
import logger from "./logger";
import { HTTP_LOG_FORMAT } from "./properties";

// This ensures that the morgan HTTP log statements are output (and controlled) by Log4js, which
// maintains consistency within the logs.

const httpLogger = morganLogger(HTTP_LOG_FORMAT, {
  stream: {
    write(str) { logger.debug(str); },
  },
});

export default httpLogger;
