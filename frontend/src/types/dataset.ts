/**
 * Mirrors the DatasetSummary Pydantic model from the backend.
 * Field names use camelCase aliases as serialised by FastAPI.
 */
export interface Dataset {
  title: string;
  description: string | null;
  accessServiceCategory: string | null;
  accessRights: string | null;
}

/**
 * Mirrors the DatasetListResponse Pydantic model from the backend.
 */
export interface DatasetListResponse {
  count: number;
  datasets: Dataset[];
}