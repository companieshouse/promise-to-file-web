import { NextFunction, Request, Response } from "express";
import * as keys from "../../keys";
import * as sessionService from "../../../services/session.service";

export default async (req: Request, res: Response, next: NextFunction) => {
  const existing = req.chSession.data[keys.PTF_SESSION];
  if (!existing) {
    await sessionService.createPromiseToFileSession(req.chSession);
  }
  next();
};
