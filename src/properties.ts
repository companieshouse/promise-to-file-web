/**
 * Gets an environment variable. If the env var is not set and a default value is not
 * provided, then it is assumed it is a mandatory requirement and an error will be
 * thrown.
 */
const getEnvironmentValue = (key: string, defaultValue?: any): string => {
    const isMandatory: boolean = !defaultValue;
    const value: string = process.env[key] || "";

    if (!value && isMandatory) {
        throw new Error(`Please set the environment variable "${key}"`);
    }

    return value || defaultValue as string;
};

export const COOKIE_SECRET = getEnvironmentValue("COOKIE_SECRET");

export const CACHE_SERVER = getEnvironmentValue("CACHE_SERVER");

export const COOKIE_NAME = getEnvironmentValue("COOKIE_NAME");

export const DEFAULT_SESSION_EXPIRATION = getEnvironmentValue("DEFAULT_SESSION_EXPIRATION");

export const INTEGER_PARSE_BASE = 10;

export const PIWIK_URL = getEnvironmentValue("PIWIK_URL");

export const PIWIK_SITE_ID = getEnvironmentValue("PIWIK_SITE_ID");

// If wishing to override the default log format of 'tiny', available formats are documented
// here - https://github.com/expressjs/morgan#predefined-formats
export const HTTP_LOG_FORMAT = getEnvironmentValue("HTTP_LOG_FORMAT", "tiny");

// If wishing to override the default log level of 'info', available levels are documented
// here - https://stritti.github.io/log4js/docu/users-guide.html#configuration
export const LOG_LEVEL = getEnvironmentValue("LOG_LEVEL", "info");

export const OAUTH2_REQUEST_KEY = getEnvironmentValue("OAUTH2_REQUEST_KEY");

export const OAUTH2_AUTH_URI = getEnvironmentValue("OAUTH2_AUTH_URI");

export const OAUTH2_CLIENT_ID = getEnvironmentValue("OAUTH2_CLIENT_ID");

export const OAUTH2_REDIRECT_URI = getEnvironmentValue("OAUTH2_REDIRECT_URI");

export const INTERNAL_API_URL = getEnvironmentValue("INTERNAL_API_URL");

export const COMPANY_STILL_REQUIRED_FEATURE_FLAG = getEnvironmentValue("COMPANY_STILL_REQUIRED_FEATURE_FLAG");
