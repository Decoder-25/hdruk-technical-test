import { useState } from "react";
import { Box, Typography, Container, Divider } from "@mui/material";
import Navbar from "../components/Navbar";
import DatasetTable from "../components/DatasetTable";
import SavedDatasetsDrawer from "../components/SavedDatasetsDrawer";
import DescriptionModal from "../components/DescriptionModal";
import useSavedDatasets from "../hooks/useSavedDatasets";
import type { Dataset } from "../types/dataset";

const HomePage = () => {
  const { savedDatasets, isSaved, toggleSave, clearAll } = useSavedDatasets();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Navbar
        savedCount={savedDatasets.length}
        onOpenSaved={() => setDrawerOpen(true)}
      />

      <Container maxWidth="xl" >
        <Box sx={{ pt: 5, pb: 3, display: 'flex', flexDirection: 'column',alignItems: 'center',textAlign: 'center'}}>
          <Typography variant="h4" color="primary" fontWeight={1000} gutterBottom>
            Dataset Catalogue
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600 }}>
            Discover health datasets available through the Health Data Research UK Gateway.
            Click any dataset title to view its full description and access information.
          </Typography>
        </Box>

        <Divider sx={{ mb: 4 }} />

        <DatasetTable isSaved={isSaved} onToggleSave={toggleSave} />

        <Box sx={{ pb: 6 }} />
      </Container>

      {/* Saved datasets drawer */}
      <SavedDatasetsDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        savedDatasets={savedDatasets}
        onSelect={(dataset) => { setSelectedDataset(dataset); setDrawerOpen(false); }}
        onRemove={toggleSave}
        onClearAll={clearAll}
      />

      {/* Modal opened from the drawer */}
      <DescriptionModal
        dataset={selectedDataset}
        onClose={() => setSelectedDataset(null)}
      />
    </Box>
  );
};

export default HomePage;