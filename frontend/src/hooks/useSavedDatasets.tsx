import { useState, useEffect } from "react";
import type { Dataset } from "../types/dataset";

const STORAGE_KEY = "hdruk_saved_datasets";

interface UseSavedDatasets {
  savedDatasets: Dataset[];
  isSaved: (title: string) => boolean;
  toggleSave: (dataset: Dataset) => void;
  clearAll: () => void;
}

const useSavedDatasets = (): UseSavedDatasets => {
  const [savedDatasets, setSavedDatasets] = useState<Dataset[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Sync to localStorage whenever savedDatasets changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedDatasets));
  }, [savedDatasets]);

  const isSaved = (title: string) =>
    savedDatasets.some((d) => d.title === title);

  const toggleSave = (dataset: Dataset) => {
    setSavedDatasets((prev) =>
      isSaved(dataset.title)
        ? prev.filter((d) => d.title !== dataset.title)
        : [...prev, dataset]
    );
  };

  const clearAll = () => setSavedDatasets([]);

  return { savedDatasets, isSaved, toggleSave, clearAll };
};

export default useSavedDatasets;