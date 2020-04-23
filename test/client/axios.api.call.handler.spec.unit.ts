const callCurrentMockRequest: jest.Mock = jest.fn(() => dummyAxiosResponse);
jest.mock("axios", () => {
  return {
    default: {
      request: callCurrentMockRequest,
    },
  };
});

import { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { getBaseAxiosRequestConfig, makeAPICall } from "../../src/client/axios.api.call.handler";

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
    expect(config.headers).toEqual({ Accept: "application/json", Authorization: "Bearer abc123" });
  });

  it("should handle successful axios call", async () => {
    const config: AxiosRequestConfig = {};
    dummyAxiosResponse.status = 200;
    const response: AxiosResponse = await makeAPICall(config);
    expect(response.status).toEqual(200);
  });

  it("should validate status using validateStatus function", async () => {
    const token: string = "abc123";
    const config: AxiosRequestConfig = getBaseAxiosRequestConfig(token);

    expect(config.validateStatus(100)).toBeFalsy();
    expect(config.validateStatus(200)).toBeTruthy();
    expect(config.validateStatus(201)).toBeTruthy();
    expect(config.validateStatus(300)).toBeFalsy();
    expect(config.validateStatus(301)).toBeFalsy();
    expect(config.validateStatus(400)).toBeTruthy();
    expect(config.validateStatus(401)).toBeFalsy();
    expect(config.validateStatus(404)).toBeFalsy();
  });

  it("should handle axios errors", async () => {
    const config: AxiosRequestConfig = {};

    const errorMessage = "There is an error";
    const dataError = "Test error";
    const statusCode = 500;

    const axiosError = {
      message: errorMessage,
      response: {
        data: {
          errors: [dataError],
        },
        status: statusCode,
      },
    } as AxiosError;

    callCurrentMockRequest.mockRejectedValueOnce(axiosError);

    const expectedError = {
      data: [dataError],
      message: errorMessage,
      status: statusCode,
    };

    await expect(makeAPICall(config)).rejects.toMatchObject(expectedError);
  });

  it("should handle axios errors with no response object", async () => {
    const config: AxiosRequestConfig = {};

    const errorMessage = "There is an error";

    const axiosError = {
      message: errorMessage,
    } as AxiosError;

    callCurrentMockRequest.mockRejectedValueOnce(axiosError);

    const expectedError = {
      data: [],
      message: errorMessage,
      status: -1,
    };

    await expect(makeAPICall(config)).rejects.toMatchObject(expectedError);
  });
});
