import { useState, useEffect } from "react";
import { fetchDatasets } from "../api/datasets";
import type { SortDirection } from "../api/datasets";
import type { Dataset, PaginationMeta } from "../types/dataset";

interface UseDatasets {
  datasets: Dataset[];
  pagination: PaginationMeta | null;
  loading: boolean;
  error: string | null;
  page: number;
  pageSize: number;
  search: string;
  sort: SortDirection;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setSearch: (search: string) => void;
  setSort: (sort: SortDirection) => void;
}

const useDatasets = (): UseDatasets => {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPageState] = useState<number>(1);
  const [pageSize, setPageSizeState] = useState<number>(10);
  const [search, setSearchState] = useState<string>("");
  const [sort, setSortState] = useState<SortDirection>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchDatasets({
          page,
          pageSize,
          search: search || undefined,
          sort,
        });
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
  }, [page, pageSize, search, sort]);

  const setSearch = (value: string) => {
    setSearchState(value);
    setPageState(1);
  };

  const setPageSize = (size: number) => {
    setPageSizeState(size);
    setPageState(1);
  };

  // Toggling sort also resets to page 1
  const setSort = (value: SortDirection) => {
    setSortState(value);
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
    sort,
    setPage: setPageState,
    setPageSize,
    setSearch,
    setSort,
  };
};

export default useDatasets;