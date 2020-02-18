const callCurrentMockRequest: jest.Mock = jest.fn( () => dummyAxiosResponse );
jest.mock("axios", () => {
    return {
        default: {
            request: callCurrentMockRequest,
        },
    };
});

import {AxiosError, AxiosRequestConfig, AxiosResponse} from "axios";
import {getBaseAxiosRequestConfig, makeAPICall} from "../../src/client/axios.api.call.handler";

const dummyAxiosResponse: AxiosResponse<any> = {
    config: {},
    data: {},
    headers: "header",
    status: 100,
    statusText: "Error",
};

describe("axios call handler", () => {
    beforeEach(() => {
        callCurrentMockRequest.mockClear();
    });

    it("should return config with the token argument value in header", async () => {
        const token: string = "abc123";
        const config: AxiosRequestConfig = getBaseAxiosRequestConfig(token);
        expect(config.headers).toEqual({Accept: "application/json", Authorization: "Bearer abc123"});
    });

    it("should handle axios call", async () => {
        const config: AxiosRequestConfig = {};
        dummyAxiosResponse.status = 200;
        const response: AxiosResponse = await makeAPICall(config);
        expect(response.status).toEqual(200);
    });

    it("should handle axios errors", async () => {
        const config: AxiosRequestConfig = {};
        dummyAxiosResponse.status = 500;

        const axiosError: AxiosError = {
            message: "There is an error",
            response: {
                data: {
                    errors : ["Test error"],
                },
                status: 500,
            },
        } as AxiosError;

        callCurrentMockRequest.mockRejectedValueOnce(axiosError);
        expect.assertions(3);

        await makeAPICall(config).catch((e) => {
            expect(e.data).toContain("Test error");
            expect(e.message).toBe("There is an error");
            expect (e.status).toEqual(500);
        });
    });
});
