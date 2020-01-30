import Session from "../../src/session/session";
import * as sessionService from "../../src/services/session.service";

jest.mock("../../src/session/store/redis.store");

describe ("cache service tests", () => {
    it("should create a new empty promise to file session", async () => {
        const session: Session = Session.newInstance();
        await sessionService.createPromiseToFileSession(session, "00006400");
        expect(session.data.ptf_session.company_number_in_context).toEqual("00006400");
    });
});
