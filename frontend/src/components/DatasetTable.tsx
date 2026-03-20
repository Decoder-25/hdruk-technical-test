import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Typography,
  Link,
  Chip,
  Box,
  TextField,
  InputAdornment,
  Alert,
  Skeleton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import useDatasets from "../hooks/useDatasets";
import DescriptionModal from "./DescriptionModal";
import type { Dataset } from "../types/dataset";

const DatasetTable = () => {
  const {
    datasets,
    pagination,
    loading,
    error,
    page,
    pageSize,
    search,
    setPage,
    setPageSize,
    setSearch,
  } = useDatasets();

  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);

  // MUI TablePagination is 0-indexed, our backend is 1-indexed
  const handlePageChange = (_: unknown, newPage: number) => {
    setPage(newPage + 1);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPageSize(parseInt(event.target.value, 10));
  };

  return (
    <Box>
      {/* Search bar */}
      <TextField
        variant="outlined"
        placeholder="Search datasets by title..."
        size="small"
        fullWidth
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" color="action" />
            </InputAdornment>
          ),
        }}
      />

      {/* Error state */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper} elevation={1}>
        <Table aria-label="HDR UK datasets table">
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Access Service Category</TableCell>
              <TableCell>Access Rights</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {/* Loading skeletons */}
            {loading &&
              Array.from({ length: pageSize }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton variant="text" width="80%" /></TableCell>
                  <TableCell><Skeleton variant="text" width="60%" /></TableCell>
                  <TableCell><Skeleton variant="text" width="40%" /></TableCell>
                </TableRow>
              ))}

            {/* Data rows */}
            {!loading &&
              datasets.map((dataset, index) => (
                <TableRow key={index}>
                  {/* Clickable title — opens modal with full description */}
                  <TableCell>
                    <Typography
                      variant="body2"
                      color="primary"
                      sx={{
                        cursor: "pointer",
                        fontWeight: 500,
                        "&:hover": { textDecoration: "underline" },
                      }}
                      onClick={() => setSelectedDataset(dataset)}
                    >
                      {dataset.title}
                    </Typography>
                  </TableCell>

                  {/* Access service category */}
                  <TableCell>
                    {dataset.accessServiceCategory ? (
                      <Chip
                        label={dataset.accessServiceCategory}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    ) : (
                      <Typography variant="body2" color="text.disabled">—</Typography>
                    )}
                  </TableCell>

                  {/* Access rights link */}
                  <TableCell>
                    {dataset.accessRights ? (
                      <Link
                        href={dataset.accessRights}
                        target="_blank"
                        rel="noopener noreferrer"
                        underline="hover"
                        sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, fontSize: "0.875rem" }}
                      >
                        Apply for access
                        <OpenInNewIcon sx={{ fontSize: 13 }} />
                      </Link>
                    ) : (
                      <Typography variant="body2" color="text.disabled">—</Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}

            {/* Empty state */}
            {!loading && datasets.length === 0 && !error && (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ py: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    No datasets found{search ? ` for "${search}"` : ""}.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* MUI Pagination — 0-indexed so subtract 1 from backend's 1-indexed page */}
        <TablePagination
          component="div"
          count={pagination?.total ?? 0}
          page={page - 1}
          onPageChange={handlePageChange}
          rowsPerPage={pageSize}
          onRowsPerPageChange={handleRowsPerPageChange}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </TableContainer>

      {/* Description modal */}
      <DescriptionModal
        dataset={selectedDataset}
        onClose={() => setSelectedDataset(null)}
      />
    </Box>
  );
};

export default DatasetTable;