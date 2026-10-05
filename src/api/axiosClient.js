import axios from "axios";
import { TOKEN_KEY } from "../utils/constants";
const baseURL = import.meta.env.VITE_API_URL;

const axiosClient = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Runs before EVERY request, so it always uses the current token
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Utility to attach the snackbar callback to Axios interceptors
export const setupAxiosInterceptors = (showSnackbar) => {
  axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
      let errorMessage = "An unexpected error occurred.";

      if (error.response) {
        // Server responded with a status code outside the 2xx range
        errorMessage =
          error.response.data?.message ||
          `Server error (${error.response.status})`;
      } else if (error.request) {
        // Request was made but no response was received (network issue)
        errorMessage = "Network error. Please check your internet connection.";
      } else {
        errorMessage = error.message;
      }

      // Display the error using the Snackbar UI
      showSnackbar(errorMessage, "error");

      return Promise.reject(error);
    },
  );
};

export default axiosClient;
