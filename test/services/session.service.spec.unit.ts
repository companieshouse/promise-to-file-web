import { saveSession } from "../../src/services/redis.service";
import * as sessionService from "../../src/services/session.service";
import * as keys from "../../src/session/keys";
import Session from "../../src/session/session";

jest.mock("../../src/session/store/redis.store", () => import("../mocks/redis.store.mock.factory"));
jest.mock("../../src/services/redis.service");

const mockSaveSession: jest.Mock = saveSession as jest.Mock;
const testKey: string = "testKey";
const testValue: string = "00006400";

describe ("session service tests", () => {

  beforeEach(() => {
    mockSaveSession.mockClear();
  });

  it("should create a new empty promise to file session", async () => {
    const session: Session = Session.newInstance();
    expect(session.data[keys.PTF_SESSION]).toBeFalsy();
    await sessionService.createPromiseToFileSession(session);
    expect(session.data[keys.PTF_SESSION]).toBeTruthy();
    expect(mockSaveSession).toBeCalledTimes(1);
    expect(mockSaveSession).toBeCalledWith(session);
  });

  it("should replace an existing promise to file session if one exists", async () => {
    const session: Session = Session.newInstance();
    await sessionService.createPromiseToFileSession(session);
    expect(session.data[keys.PTF_SESSION]).toBeTruthy();
    session.data[keys.PTF_SESSION][testKey] = testValue;

    await sessionService.createPromiseToFileSession(session);
    expect(session.data[keys.PTF_SESSION][testKey]).toBeFalsy();
  });

  it("should update the session successfully", async () => {
    const session: Session = Session.newInstance();
    await sessionService.createPromiseToFileSession(session);
    expect(session.data[keys.PTF_SESSION]).toBeTruthy();

    mockSaveSession.mockClear();
    await sessionService.updatePromiseToFileSessionValue(session, testKey, testValue);
    expect(session.data[keys.PTF_SESSION][testKey]).toEqual(testValue);
    expect(mockSaveSession).toBeCalledTimes(1);
    expect(mockSaveSession).toBeCalledWith(session);

    const newValue: string = "10";
    await sessionService.updatePromiseToFileSessionValue(session, testKey, newValue);
    expect(session.data[keys.PTF_SESSION][testKey]).toEqual(newValue);
  });

  it("should retrieve from the session successfully", async () => {
    const session: Session = Session.newInstance();
    await sessionService.createPromiseToFileSession(session);
    expect(session.data[keys.PTF_SESSION]).toBeTruthy();

    await sessionService.updatePromiseToFileSessionValue(session, testKey, testValue);
    const gotFromSessionValue: string = sessionService.getPromiseToFileSessionValue(session, testKey);
    expect(gotFromSessionValue).toEqual(testValue);
  });
});
