import apiClient from "./client";
import type { DatasetListResponse } from "../types/dataset";

interface FetchDatasetsParams {
  page: number;
  pageSize: number;
  search?: string;
}

/**
 * Fetches a paginated, optionally filtered list of datasets.
 * Corresponds to GET /api/v1/datasets on the FastAPI backend.
 */
export const fetchDatasets = async ({
  page,
  pageSize,
  search,
}: FetchDatasetsParams): Promise<DatasetListResponse> => {
  const params: Record<string, string | number> = {
    page,
    page_size: pageSize,
  };
  if (search) params.search = search;

  const response = await apiClient.get<DatasetListResponse>("/api/v1/datasets", { params });
  return response.data;
};