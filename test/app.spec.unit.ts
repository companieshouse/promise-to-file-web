import * as request from "supertest";
import app from "../src/app";
import { loadSession } from "../src/services/redis.service";
import { createPromiseToFileSession } from "../src/services/session.service";
import { loadMockSession } from "./mock.utils";

jest.mock("../src/session/store/redis.store", () => import("./mocks/redis.store.mock.factory"));
jest.mock("../src/services/redis.service");
jest.mock("../src/services/session.service");

describe("app tests", () => {

  const mockCacheService = loadSession as jest.Mock;

  beforeEach(() => {
    loadMockSession(mockCacheService);
  });

  it("should render the error page and clear the PTF session", async () => {

    const mockCreatePromiseToFileSession = createPromiseToFileSession as jest.Mock;

    mockCreatePromiseToFileSession.mockReset();

    const response = await request(app)
      .get("/invalid-page");

    // A PTF session should be created twice - once when an attempt is made to display the page
    // and, importantly, a second time when the error page is shown and the PTF session re-initialised
    expect(mockCreatePromiseToFileSession).toHaveBeenCalledTimes(2);

    expect(response.status).toEqual(404);
    expect(response.text).toMatch(/Sorry, there is a problem with the service/);
  });
});
