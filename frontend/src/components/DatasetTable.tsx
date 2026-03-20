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
  Chip,
  Box,
  TextField,
  InputAdornment,
  Alert,
  Skeleton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import TableRowsIcon from "@mui/icons-material/TableRows";
import ViewListIcon from "@mui/icons-material/ViewList";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import useDatasets from "../hooks/useDatasets";
import DescriptionModal from "./DescriptionModal";
import DatasetListView from "../components/DatasetList";
import type { Dataset } from "../types/dataset";
import type { SortDirection } from "../api/datasets";

type ViewMode = "table" | "list";

interface DatasetTableProps {
  isSaved: (title: string) => boolean;
  onToggleSave: (dataset: Dataset) => void;
}

const DatasetTable = ({ isSaved, onToggleSave }: DatasetTableProps) => {
  const {
    datasets,
    pagination,
    loading,
    error,
    page,
    pageSize,
    search,
    sort,
    setPage,
    setPageSize,
    setSearch,
    setSort,
  } = useDatasets();

  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  const handlePageChange = (_: unknown, newPage: number) => setPage(newPage + 1);

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPageSize(parseInt(event.target.value, 10));
  };

  const handleSortChange = (value: string) => {
    setSort(value === "default" ? null : (value as SortDirection));
  };

  const startResult = pagination ? (page - 1) * pageSize + 1 : 0;
  const endResult = pagination ? Math.min(page * pageSize, pagination.total) : 0;

  return (
    <Box>
      {/* Controls row */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2, flexWrap: "wrap" }}>
        <TextField
          variant="outlined"
          placeholder="Search datasets by title..."
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flexGrow: 1, maxWidth: 480 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
        />

        <FormControl size="small">
          <Select
            value={sort ?? "default"}
            onChange={(e) => handleSortChange(e.target.value)}
            displayEmpty
            sx={{ minWidth: 240, fontSize: "0.875rem" }}
          >
            <MenuItem value="default">Sort by most relevant</MenuItem>
            <MenuItem value="asc">Sort alphabetically by title (A-Z)</MenuItem>
            <MenuItem value="desc">Sort alphabetically by title (Z-A)</MenuItem>
          </Select>
        </FormControl>

        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(_, val) => { if (val) setViewMode(val); }}
          size="small"
          sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1 }}
        >
          <Tooltip title="Table view">
            <ToggleButton value="table" sx={{ px: 1.5, border: "none" }}>
              <TableRowsIcon fontSize="small" />
            </ToggleButton>
          </Tooltip>
          <Tooltip title="List view">
            <ToggleButton value="list" sx={{ px: 1.5, border: "none" }}>
              <ViewListIcon fontSize="small" />
            </ToggleButton>
          </Tooltip>
        </ToggleButtonGroup>

        <Box sx={{ flexGrow: 1 }} />

        {!loading && pagination && (
          <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
            Showing <strong>{startResult}–{endResult}</strong> of{" "}
            <strong>{pagination.total}</strong> datasets
          </Typography>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* List view */}
      {viewMode === "list" && (
        <>
          <DatasetListView
            datasets={datasets}
            loading={loading}
            pageSize={pageSize}
            onSelect={setSelectedDataset}
            isSaved={isSaved}
            onToggleSave={onToggleSave}
          />
          {!loading && datasets.length === 0 && !error && (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <Typography variant="body1" color="text.secondary" fontWeight={500}>No datasets found</Typography>
              {search && <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>Try a different search term</Typography>}
            </Box>
          )}
          {!loading && pagination && (
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
              <TablePagination
                component="div"
                count={pagination.total}
                page={page - 1}
                onPageChange={handlePageChange}
                rowsPerPage={pageSize}
                onRowsPerPageChange={handleRowsPerPageChange}
                rowsPerPageOptions={[5, 10, 25, 50]}
              />
            </Box>
          )}
        </>
      )}

      {/* Table view */}
      {viewMode === "table" && (
        <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
          <Table aria-label="HDR UK datasets table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: "60%" }}>Dataset Title</TableCell>
                <TableCell sx={{ width: "30%" }}>Access Service</TableCell>
                <TableCell sx={{ width: "10%" }} />
              </TableRow>
            </TableHead>

            <TableBody>
              {loading && Array.from({ length: pageSize }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton variant="text" width="75%" /></TableCell>
                  <TableCell><Skeleton variant="rounded" width={120} height={24} /></TableCell>
                  <TableCell />
                </TableRow>
              ))}

              {!loading && datasets.map((dataset, index) => (
                <TableRow
                  key={index}
                  sx={{ bgcolor: index % 2 === 0 ? "transparent" : "rgba(0,0,0,0.015)", "&:last-child td": { border: 0 } }}
                >
                  <TableCell sx={{ maxWidth: 0 }}>
                    <Tooltip title={dataset.title} placement="top-start" enterDelay={600}>
                      <Typography
                        variant="body2"
                        color="primary"
                        sx={{ cursor: "pointer", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", "&:hover": { textDecoration: "underline" } }}
                        onClick={() => setSelectedDataset(dataset)}
                      >
                        {dataset.title}
                      </Typography>
                    </Tooltip>
                  </TableCell>

                  <TableCell>
                    {dataset.accessServiceCategory ? (
                      <Chip
                        label={dataset.accessServiceCategory}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ maxWidth: "100%", height: "auto", "& .MuiChip-label": { whiteSpace: "normal", py: 0.5 } }}
                      />
                    ) : (
                      <Typography variant="body2" color="text.disabled">Not specified</Typography>
                    )}
                  </TableCell>

                  {/* Bookmark column */}
                  <TableCell align="center">
                    <Tooltip title={isSaved(dataset.title) ? "Remove bookmark" : "Save dataset"}>
                      <IconButton
                        size="small"
                        onClick={() => onToggleSave(dataset)}
                        sx={{ color: isSaved(dataset.title) ? "primary.main" : "text.disabled", "&:hover": { color: "primary.main" } }}
                      >
                        {isSaved(dataset.title)
                          ? <BookmarkIcon fontSize="small" />
                          : <BookmarkBorderIcon fontSize="small" />
                        }
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}

              {!loading && datasets.length === 0 && !error && (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 8 }}>
                    <Typography variant="body1" color="text.secondary" fontWeight={500}>No datasets found</Typography>
                    {search && <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>Try a different search term</Typography>}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <TablePagination
            component="div"
            count={pagination?.total ?? 0}
            page={page - 1}
            onPageChange={handlePageChange}
            rowsPerPage={pageSize}
            onRowsPerPageChange={handleRowsPerPageChange}
            rowsPerPageOptions={[5, 10, 25, 50]}
            sx={{ borderTop: "1px solid", borderColor: "divider" }}
          />
        </TableContainer>
      )}

      <DescriptionModal dataset={selectedDataset} onClose={() => setSelectedDataset(null)} />
    </Box>
  );
};

export default DatasetTable;