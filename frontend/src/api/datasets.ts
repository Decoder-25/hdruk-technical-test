import apiClient from "./client";
import type { DatasetListResponse } from "../types/dataset";

/**
 * Fetches all datasets from the backend.
 * Corresponds to GET /api/v1/datasets on the FastAPI backend.
 */
export const fetchDatasets = async (): Promise<DatasetListResponse> => {
  const response = await apiClient.get<DatasetListResponse>("/api/v1/datasets");
  return response.data;
};