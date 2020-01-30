import Session from "../../src/session/session";
import * as sessionService from "../../src/services/session.service";
import * as keys from "../../src/session/keys";

describe ("cache service tests", () => {

  it("should create a new empty promise to file session", async () => {
    const session: Session = Session.newInstance();
    await sessionService.createPromiseToFileSession(session);
    await sessionService.updatePromiseToFileSessionValue(session, keys.COMPANY_NUMBER, "00006400");
    expect(session.data.ptf_session.company_number).toEqual("00006400");
  });
});
