// import AbstractHandler from "../confirmation.handler";
// import { NextFunction, Request, Response } from "express";
//
// export class APIResponseDataHandler extends AbstractHandler{
//     public async handle(req: Request, res: Response, next: NextFunction, ctx: Map<string,any>) : Promise<void> {
//      const getOverdueFiling = ({isAccountsOverdue, isConfirmationStatementOverdue}): string => {
//         let overdueFiling: string = "";
//
//         if (isAccountsOverdue && !isConfirmationStatementOverdue) {
//           overdueFiling = "accounts";
//         } else if (!isAccountsOverdue && isConfirmationStatementOverdue) {
//           overdueFiling = "confirmation statement";
//         } else if (isAccountsOverdue && isConfirmationStatementOverdue) {
//           overdueFiling = "accounts and confirmation statement";
//         } else {
//           // TODO Neither the accounts or the confirmation statement are overdue - handle this
//           //      output with appropriate render when story is created.
//           overdueFiling = "nothing overdue";
//         }
//
//         return overdueFiling;
//       }
//     }
// }