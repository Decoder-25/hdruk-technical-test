import { useState, useEffect } from "react";
import { fetchDatasets } from "../api/datasets";
import type { Dataset, PaginationMeta } from "../types/dataset";

interface UseDatasets {
  datasets: Dataset[];
  pagination: PaginationMeta | null;
  loading: boolean;
  error: string | null;
  page: number;
  pageSize: number;
  search: string;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setSearch: (search: string) => void;
}

/**
 * Manages dataset fetching, pagination, and search state.
 * Triggers a new API call whenever page, pageSize, or search changes.
 * Search resets the page back to 1 automatically.
 */
const useDatasets = (): UseDatasets => {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPageState] = useState<number>(1);
  const [pageSize, setPageSizeState] = useState<number>(10);
  const [search, setSearchState] = useState<string>("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchDatasets({ page, pageSize, search: search || undefined });
        setDatasets(data.datasets);
        setPagination(data.pagination);
      } catch (err) {
        setError("Failed to load datasets. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [page, pageSize, search]);

  // Reset to page 1 when search changes
  const setSearch = (value: string) => {
    setSearchState(value);
    setPageState(1);
  };

  // Reset to page 1 when page size changes
  const setPageSize = (size: number) => {
    setPageSizeState(size);
    setPageState(1);
  };

  return {
    datasets,
    pagination,
    loading,
    error,
    page,
    pageSize,
    search,
    setPage: setPageState,
    setPageSize,
    setSearch,
  };
};

export default useDatasets;