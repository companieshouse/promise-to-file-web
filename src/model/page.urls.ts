import { Templates } from "./template.paths";

/**
 * Keep template names in template.paths.ts and reference them in here for URLs
 */

export const ROOT: string = "/";
const SEPARATOR: string = "/";
export const PROMISE_TO_FILE: string = SEPARATOR + "promise-to-file";
export const COMPANY_NUMBER: string = SEPARATOR + Templates.COMPANY_NUMBER;
export const CHECK_COMPANY: string = SEPARATOR + Templates.CHECK_COMPANY;
export const COMPANY_AUTH_PROTECTED_ROUTE: string = SEPARATOR + "company/:companyNumber/";

/**
 * Company Auth protected routes
 */
export const WARNING: string = COMPANY_AUTH_PROTECTED_ROUTE + Templates.WARNING;
export const STILL_REQUIRED: string = COMPANY_AUTH_PROTECTED_ROUTE + Templates.STILL_REQUIRED;
export const CONFIRMATION: string = COMPANY_AUTH_PROTECTED_ROUTE + "confirmation";

/**
 * URLs for redirects will need to start with the application name
 */
export const PROMISE_TO_FILE_COMPANY_NUMBER: string = PROMISE_TO_FILE + COMPANY_NUMBER;
export const PROMISE_TO_FILE_CHECK_COMPANY: string = PROMISE_TO_FILE + CHECK_COMPANY;
export const PROMISE_TO_FILE_CONFIRMATION: string = PROMISE_TO_FILE + CONFIRMATION;
