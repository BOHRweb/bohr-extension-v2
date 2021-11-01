import axios from "axios"
import qs from 'qs'

const BASE_URL = 'https://mainnetapi.bohrchain.com/v2.4.0/';

export function fetch(options) {
    return new Promise((resolve, reject) => {
        const instance = axios.create({
            baseURL: options.baseURL ? options.baseURL : BASE_URL,
            timeout: 100000,
            // transform params
            transformRequest:(data) => {
                return qs.stringify(data)
            }
            // headers: {
            //     'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
            //     // 'Content-Type': 'application/json;charset=UTF-8'
            // },
        });
        instance.interceptors.response.use(
            response => {
                let data;

                if (response.data === undefined) {
                    data = response.request.responseText;
                } else {
                    data = response.data;
                }
                return data.data || data;
            },
            err => {
                return Promise.reject(err);
            }
        );
        instance(options)
            .then(res => {
                resolve(res);
            })
            .catch(error => {
                reject(error);
            });
    });
}
