import { Templates } from "./template.paths";

/**
 * Keep template names in template.paths.ts and reference them in here for URLs
 */

export const ROOT: string = "/";
const SEPARATOR: string = "/";
export const COMPANY_REQUIRED: string = SEPARATOR + "company-required";
export const COMPANY_NUMBER: string = SEPARATOR + Templates.COMPANY_NUMBER;
export const CHECK_COMPANY: string = SEPARATOR + Templates.CHECK_COMPANY;
export const COMPANY_AUTH_PROTECTED_ROUTE: string = SEPARATOR + "company/:companyNumber/";
export const HEALTHCHECK: string = COMPANY_REQUIRED + SEPARATOR + "healthcheck";

/**
 * Company Auth protected routes
 */
export const WARNING: string = COMPANY_AUTH_PROTECTED_ROUTE + Templates.WARNING;
export const STILL_REQUIRED: string = COMPANY_AUTH_PROTECTED_ROUTE + Templates.STILL_REQUIRED;
export const CONFIRMATION: string = COMPANY_AUTH_PROTECTED_ROUTE + "confirmation";

/**
 * URLs for redirects will need to start with the application name
 */
export const COMPANY_REQUIRED_COMPANY_NUMBER: string = COMPANY_REQUIRED + COMPANY_NUMBER;
export const COMPANY_REQUIRED_CHECK_COMPANY: string = COMPANY_REQUIRED + CHECK_COMPANY;
export const COMPANY_REQUIRED_CONFIRMATION: string = COMPANY_REQUIRED + CONFIRMATION;
export const COMPANY_REQUIRED_WARNING: string = COMPANY_REQUIRED + WARNING;
