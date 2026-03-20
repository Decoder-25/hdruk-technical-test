import axios from "axios";

/**
 * Central Axios instance.
 * Base URL is driven by the VITE_API_BASE_URL env variable so it works
 * across local dev, staging, and production without code changes.
 */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;