import { Box, Typography, Container } from "@mui/material";
import DatasetTable from "../components/DatasetTable";

const HomePage = () => {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: 6 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box mb={5}>
          <Typography variant="h4" color="primary" gutterBottom>
            HDR UK Dataset Catalogue
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Discover health datasets available through the Health Data Research
            UK Gateway. Click a dataset title to view its full description.
          </Typography>
        </Box>

        {/* Table */}
        <DatasetTable />
      </Container>
    </Box>
  );
};

export default HomePage;