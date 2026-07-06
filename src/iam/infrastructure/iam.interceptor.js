/**
 * Axios request interceptor that attaches the IAM bearer token to outbound
 * requests whenever a token is present in local storage.
 *
 * It reads the token directly from local storage (instead of importing the IAM
 * store) to avoid a circular dependency between the shared API client and the
 * bounded-context store that depends on it.
 *
 * @param {import('axios').InternalAxiosRequestConfig} config - Axios request configuration.
 * @returns {import('axios').InternalAxiosRequestConfig} Updated request configuration.
 */
export const iamInterceptor = (config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
};
