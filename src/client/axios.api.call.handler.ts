import {AxiosError, AxiosRequestConfig, AxiosResponse, Method} from "axios";
import axios from "axios";
import logger from "../logger";

export const HTTP_POST: Method = "post";

export const getBaseAxiosRequestConfig = (token: string): AxiosRequestConfig => {
    return {
        headers: {
            Accept: "application/json",
            Authorization: "Bearer " + token,
        },
        proxy: false,
    };
};

export const makeAPICall = async (config: AxiosRequestConfig): Promise<AxiosResponse> => {
    try {
        return await axios.request<any>(config);
    } catch (err) {
        logger.error(`API ERROR ${err}`);
        const axiosError = err as AxiosError;
        const {response, message} = axiosError;
        throw {
            data: response ? response.data.errors : [],
            message,
            status: response ? response.status : -1,
        };
    }
};
