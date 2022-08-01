import { NextFunction, Request, Response } from "express";

 abstract class AbstractHandler
{
    private nextHandler: AbstractHandler;

    public setNext(handler: AbstractHandler): AbstractHandler {
        this.nextHandler = handler;
    
        return handler;
    }

    public handle(req: Request, res: Response, next: NextFunction, ctx: Map<String,any>): void {
        if (this.nextHandler) {
            return this.nextHandler.handle(req, res, next, ctx);
        }
    }
}
export default AbstractHandler;
