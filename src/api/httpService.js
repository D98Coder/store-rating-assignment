import axiosClient from "./axiosClient";

/**
 * Universal HTTP request handler
 * @param {Object} options Configuration options
 * @param {'GET'|'POST'|'PUT'|'DELETE'|'PATCH'} options.method HTTP method
 * @param {string} options.url Endpoint path
 * @param {Object} [options.data] Payload for POST/PUT requests
 * @param {Object} [options.params] Query parameters for GET requests
 * @param {Object} [options.headers] Custom headers
 */
export const httpRequest = async ({
  method = "GET",
  url,
  data = null,
  params = null,
  headers = {},
}) => {
  try {
    const response = await axiosClient({
      method,
      url,
      data,
      params,
      headers,
    });
    return response.data;
  } catch (error) {
    // Error notification is automatically triggered by the Axios response interceptor
    throw error;
  }
};
