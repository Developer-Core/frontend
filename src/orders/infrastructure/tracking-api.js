import { BaseApi } from '../../shared/infrastructure/base-api.js';

/**
 * Infrastructure gateway for the public order tracking endpoint. It is anonymous
 * (`GET /tracking/{publicTrackingId}`) and returns only a privacy-safe status:
 * current stage, estimated delivery date and completion percentage.
 *
 * @class TrackingApi
 * @extends BaseApi
 */
export class TrackingApi extends BaseApi {
    /**
     * Fetches the public tracking status for an order by its public tracking id.
     * @param {string} publicTrackingId - Public tracking GUID.
     * @returns {Promise<import('axios').AxiosResponse>} Tracking status response.
     */
    getStatus(publicTrackingId) {
        return this.http.get(`/tracking/${publicTrackingId}`);
    }
}
