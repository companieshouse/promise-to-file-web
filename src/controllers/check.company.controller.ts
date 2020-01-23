import { NextFunction, Request, Response } from "express";

export const route = async (req: Request, res: Response, next: NextFunction): Promise<void> => {

    const scenario = { company: { PTFRequested: "Yes", accountsDue: "01 January 2020",
            accountsStatus: "overdue", address: "25 No Street, Nowhere", companyType: "Private Limited Company",
            csDue: "02 January 2020", csStatus: "overdue", incorporationDate: "01 January 2000",
            name: "Test Company LTD", number: "00001111", status: "Active" }};

    return res.render("check-company", {
        scenario,
    });
};

export const confirmCompanyStartRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    return next();
};
