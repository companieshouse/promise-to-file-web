import { Request, Response } from "express";
import ptfSessionLoader from "../../../src/session/middleware/ptf.session";
import Session from "../../../src/session/session";
import { PTF_SESSION } from "../../../src/session/keys";

jest.mock("../../../src/services/redis.service");

declare global {
  namespace Express {
    interface Request {
      chSession: Session;
    }
  }
}

let req: Request;
let res: Response;
const mockNextFunction: jest.Mock = jest.fn();

describe("PTF session tests", () => {

  beforeEach(() => {
    req = {} as Request;
    res = {} as Response;
    mockNextFunction.mockReset();
  });

  it("Should create a PTF session if one does not exist", async () => {
    req.chSession = Session.newWithCookieId("123");
    req.chSession.data = {};

    await ptfSessionLoader(req, res, mockNextFunction);
    expect(req.chSession.data[PTF_SESSION]).toBeTruthy();
    expect(mockNextFunction).toBeCalledTimes(1);
  });

  it("Should not create a new PTF session if one already exists", async () => {
    const testKey: string = "test";
    const testValue: string = "value";
    req.chSession = Session.newWithCookieId("123");
    req.chSession.data = {};
    req.chSession.data[PTF_SESSION] = {};
    req.chSession.data[PTF_SESSION][testKey] = testValue;

    await ptfSessionLoader(req, res, mockNextFunction);
    expect(req.chSession.data[PTF_SESSION][testKey]).toEqual(testValue);
  });

  it("Should throw a TypeError if req.chSession missing", async () => {
    expect(req.chSession).toBeFalsy();
    await expect(ptfSessionLoader(req, res, mockNextFunction)).rejects.toThrow(TypeError);
  });

  it("Should throw a TypeError if req.chSession.data missing", async () => {
    req.chSession = Session.newWithCookieId("123");
    expect(req.chSession).toBeTruthy();
    expect(req.chSession.data).toBeFalsy();
    await expect(ptfSessionLoader(req, res, mockNextFunction)).rejects.toThrow(TypeError);
  });
});
