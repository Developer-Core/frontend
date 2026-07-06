import axios from 'axios';
import { iamInterceptor } from '../../iam/infrastructure/iam.interceptor.js';

const platformApi = import.meta.env.VITE_WOODROUTE_API_URL;

/**
 * Shared infrastructure API client factory for bounded contexts.
 *
 * @class BaseApi
 */
export class BaseApi {
    #http;

    /**
     * Creates an Axios HTTP client configured for the platform API.
     */
    constructor() {
        this.#http = axios.create({
            baseURL: platformApi,
            headers: { 'Content-Type': 'application/json' }
        });
        // Attach the IAM bearer token to every outbound request of this client.
        this.#http.interceptors.request.use(iamInterceptor);
    }

    /**
     * Low-level HTTP client used by infrastructure endpoints.
     * @returns {import('axios').AxiosInstance} Axios client instance.
     */
    get http() { return this.#http; }
}
