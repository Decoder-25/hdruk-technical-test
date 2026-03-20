import { useState, useEffect } from "react";
import { fetchDatasets } from "../api/datasets";
import type { Dataset } from "../types/dataset";

interface UseDatasets {
  datasets: Dataset[];
  loading: boolean;
  error: string | null;
}

/**
 * Fetches all datasets on mount and exposes loading / error states.
 * The full dataset array is held in memory here — the modal reads
 * from this same array with no extra API call needed.
 */
const useDatasets = (): UseDatasets => {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchDatasets();
        setDatasets(data.datasets);
      } catch (err) {
        setError("Failed to load datasets. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return { datasets, loading, error };
};

export default useDatasets;