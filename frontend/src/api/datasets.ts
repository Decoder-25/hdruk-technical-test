import apiClient from "./client";
import type { DatasetListResponse } from "../types/dataset";

export type SortDirection = "asc" | "desc" | null;

interface FetchDatasetsParams {
  page: number;
  pageSize: number;
  search?: string;
  sort?: SortDirection;
}

export const fetchDatasets = async ({
  page,
  pageSize,
  search,
  sort,
}: FetchDatasetsParams): Promise<DatasetListResponse> => {
  const params: Record<string, string | number> = {
    page,
    page_size: pageSize,
  };
  if (search) params.search = search;
  if (sort) params.sort = sort;

  const response = await apiClient.get<DatasetListResponse>("/api/v1/datasets", { params });
  return response.data;
};