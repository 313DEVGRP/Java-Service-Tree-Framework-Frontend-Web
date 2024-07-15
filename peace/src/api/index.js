import axios from 'axios';

const instance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_ADDR,
  withCredentials: true,
  timeout: 3000,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'X-Requested-With': 'XMLHttpRequest',
    Accept: 'application/json',
  },
});

instance.interceptors.response.use(
  (response) => Promise.resolve(response),
  (error) => Promise.reject(error),
);

/**
 *
 * @type {function(string): function(...string): function(...any): string}
 */
export const getRequestURL =
  (baseURL) =>
  (...path) =>
  (...params) =>
    `/${baseURL}`.concat(`/${path}`.repeat(path.length)).concat(`/${params}`.repeat(params.length));

export default instance;
