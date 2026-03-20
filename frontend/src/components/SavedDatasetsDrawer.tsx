import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Tooltip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import BookmarkRemoveIcon from "@mui/icons-material/BookmarkRemove";
import type { Dataset } from "../types/dataset";

interface SavedDatasetsDrawerProps {
  open: boolean;
  onClose: () => void;
  savedDatasets: Dataset[];
  onSelect: (dataset: Dataset) => void;
  onRemove: (dataset: Dataset) => void;
  onClearAll: () => void;
}

const SavedDatasetsDrawer = ({
  open,
  onClose,
  savedDatasets,
  onSelect,
  onRemove,
  onClearAll,
}: SavedDatasetsDrawerProps) => {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: 420, display: "flex", flexDirection: "column" } }}
    >
      {/* Header */}
      <Box sx={{ px: 3, py: 2.5, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box>
          <Typography variant="h6" fontWeight={600}>
            Saved Datasets
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {savedDatasets.length} dataset{savedDatasets.length !== 1 ? "s" : ""} saved
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <Divider />

      {/* Empty state */}
      {savedDatasets.length === 0 && (
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", px: 3, textAlign: "center" }}>
          <Typography variant="body1" color="text.secondary" fontWeight={500}>
            No saved datasets yet
          </Typography>
          <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>
            Click the bookmark icon on any dataset to save it here
          </Typography>
        </Box>
      )}

      {/* Saved list */}
      {savedDatasets.length > 0 && (
        <Box sx={{ flex: 1, overflowY: "auto", px: 2, py: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
          {savedDatasets.map((dataset, index) => (
            <Card
              key={index}
              elevation={0}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                transition: "border-color 0.15s",
                "&:hover": { borderColor: "primary.light" },
              }}
            >
              <CardActionArea onClick={() => { onSelect(dataset); onClose(); }} sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: 2, pr: 6, position: "relative" }}>
                  <Typography
                    variant="body2"
                    color="primary"
                    fontWeight={600}
                    sx={{ lineHeight: 1.4, mb: 0.75 }}
                  >
                    {dataset.title}
                  </Typography>

                  {dataset.accessServiceCategory && (
                    <Chip
                      label={dataset.accessServiceCategory}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ height: "auto", "& .MuiChip-label": { whiteSpace: "normal", py: 0.3, fontSize: "0.7rem" } }}
                    />
                  )}

                  {/* Remove bookmark button */}
                  <Tooltip title="Remove bookmark">
                    <IconButton
                      size="small"
                      onClick={(e) => { e.stopPropagation(); onRemove(dataset); }}
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        color: "text.disabled",
                        "&:hover": { color: "error.main" },
                      }}
                    >
                      <BookmarkRemoveIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </Box>
      )}

      {/* Footer — clear all */}
      {savedDatasets.length > 0 && (
        <>
          <Divider />
          <Box sx={{ px: 3, py: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              color="error"
              size="small"
              onClick={onClearAll}
              sx={{ textTransform: "none" }}
            >
              Clear all saved datasets
            </Button>
          </Box>
        </>
      )}
    </Drawer>
  );
};

export default SavedDatasetsDrawer;