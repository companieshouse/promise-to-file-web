import * as request from "supertest";
import app from "../../src/app";
import { HEALTHCHECK } from "../../src/model/page.urls";
import { loadSession } from "../../src/services/redis.service";
import { expect, jest } from "@jest/globals";

jest.mock("../../src/session/store/redis.store", () => import("../mocks/redis.store.mock.factory"));
jest.mock("../../src/services/redis.service");
const mockCacheService = loadSession as jest.Mock;
jest.mock("ioredis", () => require("ioredis-mock"));

describe("Health check controller tests", () => {

    it("should return 200", async () => {
        const response = await request(app)
            .get(HEALTHCHECK);
        expect(response.status).toBe(200);
        expect(response.text).toEqual("OK");

        expect(mockCacheService).toBeCalledTimes(0);
    });
});
