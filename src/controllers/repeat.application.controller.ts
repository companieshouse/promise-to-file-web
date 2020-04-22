import { NextFunction, Request, Response } from "express";
import { Templates } from "../model/template.paths";
import { getPromiseToFileSessionValue } from "../services/session.service";
import { COMPANY_PROFILE } from "../session/keys";

const route = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const companyName: string = getPromiseToFileSessionValue(req.chSession, COMPANY_PROFILE).companyName;
    return res.render(Templates.REPEAT_APPLICATION, {
        companyName,
    });
};

export default [route];
