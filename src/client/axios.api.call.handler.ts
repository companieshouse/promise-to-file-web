import { AxiosError, AxiosRequestConfig, AxiosResponse, Method } from "axios";
import axios from "axios";
import logger from "../logger";

export const HTTP_POST: Method = "post";

/**
 * A base axios config that is common for API calls.
 * @param token Bearer token for API call
 */
export const getBaseAxiosRequestConfig = (token: string): AxiosRequestConfig => {
    return {
        headers: {
            Accept: "application/json",
            Authorization: "Bearer " + token,
        },
        proxy: false,
        validateStatus: (status) => {
          return ((status >= 200 && status < 300) || status === 400);
        },
    };
};

/**
 * Makes a call to whatever url is set in AxiosRequestConfig and returns the result of that
 * call in AxiosResponse.
 * Will throw error if unable to make call.
 * Throws error if unable to make call
 * @param config: AxiosRequestConfig
 */
export const makeAPICall = async (config: AxiosRequestConfig): Promise<AxiosResponse> => {
    try {
        return await axios.request<any>(config);
    } catch (err) {
        logger.error(`API ERROR ${JSON.stringify(err, null, 2)}`);
        const axiosError = err as AxiosError;
        const {response, message} = axiosError;
        throw {
            data: response ? response.data.errors : [],
            message,
            status: response ? response.status : -1,
        };
    }
};
