import { expect, jest } from "@jest/globals";

const callCurrentMockRequest: jest.Mock = jest.fn(() => callCurrentAxiosResponse);
jest.mock("axios", () => {
    return {
        default: {
            request: callCurrentMockRequest
        }
    };
});

import { AxiosResponse } from "axios"; // eslint-disable-line import/first
import { callPromiseToFileAPI } from "../../src/client/apiclient"; // eslint-disable-line import/first

const companyNumber: string = "00006400";
const token: string = "abc123";

const callCurrentAxiosResponse: AxiosResponse<any> = {
    config: {},
    data: {},
    headers: "header",
    status: 200,
    statusText: "OK"
};

describe("apiclient call current on ptf api unit tests", () => {
    beforeEach(() => {
        callCurrentMockRequest.mockClear();
    });

    it("should get ok response when is still required is true", async () => {
        const result = await callPromiseToFileAPI(companyNumber, token, true);
        const args = callCurrentMockRequest.mock.calls[0][0];
        expect(args.url).toContain(companyNumber);
        expect(result.status).toEqual(200);
    });

    it("should get ok response when is still required is false", async () => {
        const result = await callPromiseToFileAPI(companyNumber, token, false);
        const args = callCurrentMockRequest.mock.calls[0][0];
        expect(args.url).toContain(companyNumber);
        expect(result.status).toEqual(200);
    });
});
