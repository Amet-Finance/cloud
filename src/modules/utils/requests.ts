import axios, { AxiosRequestConfig } from 'axios';

async function get(url: string, config?: AxiosRequestConfig) {
    const response = await axios.get(url, config);
    return response.data;
}

async function post(url: string, body?: any, config?: AxiosRequestConfig) {
    const response = await axios.post(url, body, config);
    return response.data;
}

async function put(url: string, body?: any, config?: AxiosRequestConfig) {
    const response = await axios.put(url, body, config);
    return response.data;
}

const Requests = {
    get,
    post,
    put
};
export default Requests;
