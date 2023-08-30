import { Request, Response } from "express";

/**
 * GET controller for healthcheck
 * @param req
 * @param res
 */
export const route = (req: Request, res: Response) => {
    return res.sendStatus(200);
  };

export default route;
