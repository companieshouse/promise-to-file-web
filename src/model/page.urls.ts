export const ROOT: string = "/";
export const PROMISE_TO_FILE: string = "/promise-to-file";
export const COMPANY_NUMBER: string = "/company-number";
export const CHECK_COMPANY: string = "/check-company";
export const COMPANY_AUTH_PROTECTED_ROUTE = "/company/:companyNumber/";

export const PROMISE_TO_FILE_COMPANY_NUMBER: string = PROMISE_TO_FILE + COMPANY_NUMBER;
export const PROMISE_TO_FILE_CHECK_COMPANY: string = PROMISE_TO_FILE + CHECK_COMPANY;

export const CONTINUE_TRADING = COMPANY_AUTH_PROTECTED_ROUTE + "continue-trading";
