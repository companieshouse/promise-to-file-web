import * as TEMPLATE from "./template.paths";

/**
 * Keep template names in template.paths.ts and reference them in here for URLs
 * The app is set up to use pageURLs.PROMISE_TO_FILE as the base url so all urls in here
 * will be automatically applied to the end of the base url when forwarding/redirecting.
 */

const SEPARATOR: string = "/";
export const ROOT: string = "/";
export const PROMISE_TO_FILE: string = SEPARATOR + "promise-to-file";
export const COMPANY_NUMBER: string = SEPARATOR + TEMPLATE.COMPANY_NUMBER;
