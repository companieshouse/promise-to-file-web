import { NextFunction, Request, Response } from "express";

/**
 * GET controller for healthcheck
 * @param req
 * @param res
 * @param next
 */
export const route = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    res.sendStatus(200);
  };
  
  export default [route];
  