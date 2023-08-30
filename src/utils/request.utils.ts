import logger from "../logger";

export const COMPANY_REQUIRED_WL = "/company-required";
export const COMPANY_NUMBER_WL = "/company-required/company-number";
export const CHECK_COMPANY_WL = "/company-required/check-company";

const REDIRECTS_WHITELIST: string[] = [
    COMPANY_REQUIRED_WL,
    COMPANY_NUMBER_WL,
    CHECK_COMPANY_WL,
];

export const getWhitelistedReturnToURL = (returnToUrl: string) => {
    logger.info(`Looking up return to URL ${returnToUrl} in whitelist.`);
    if (REDIRECTS_WHITELIST.includes(returnToUrl)) {
        return returnToUrl;
    }
    // If the return url is not in the whitelist, provide a safe default url to return to
    return COMPANY_REQUIRED_WL;
};
