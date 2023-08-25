import { NextFunction, Request, Response } from "express";
import ConfirmationHandlerContext from "../utils/confirmation.handler.context";

abstract class AbstractHandler {
    private nextHandler: AbstractHandler; // eslint-disable-line no-use-before-define

    public setNext (handler: AbstractHandler): AbstractHandler {
        this.nextHandler = handler;

        return handler;
    }

    public handle (req: Request, res: Response, next: NextFunction, ctx: ConfirmationHandlerContext): void {
        if (this.nextHandler) {
            return this.nextHandler.handle(req, res, next, ctx);
        }
    }
}
export default AbstractHandler;
