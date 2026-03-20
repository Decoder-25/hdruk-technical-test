/**
 * Mirrors the DatasetSummary Pydantic model from the backend.
 */
export interface Dataset {
  title: string;
  description: string | null;
  accessServiceCategory: string | null;
  accessRights: string | null;
}

/**
 * Mirrors the PaginationMeta Pydantic model from the backend.
 */
export interface PaginationMeta {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

/**
 * Mirrors the DatasetListResponse Pydantic model from the backend.
 */
export interface DatasetListResponse {
  pagination: PaginationMeta;
  datasets: Dataset[];
}