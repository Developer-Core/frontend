import axios from 'axios';

/**
 * Centralized Axios instance for all API communication.
 *
 * All bounded context API clients (e.g. OrdersApi, InventoryApi) must extend
 * or use this instance — never create a raw axios instance elsewhere.
 *
 * @type {import('axios').AxiosInstance}
 */
const http = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000',
    headers: { 'Content-Type': 'application/json' }
});

export default http;
