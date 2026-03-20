import {
  Box,
  Typography,
  Chip,
  Card,
  CardActionArea,
  CardContent,
  Skeleton,
  IconButton,
  Tooltip,
  Stack,
} from "@mui/material";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import type { Dataset } from "../types/dataset";

interface DatasetListViewProps {
  datasets: Dataset[];
  loading: boolean;
  pageSize: number;
  onSelect: (dataset: Dataset) => void;
  isSaved: (title: string) => boolean;
  onToggleSave: (dataset: Dataset) => void;
}

const DatasetListView = ({
  datasets,
  loading,
  pageSize,
  onSelect,
  isSaved,
  onToggleSave,
}: DatasetListViewProps) => {
  if (loading) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {Array.from({ length: pageSize }).map((_, i) => (
          <Card key={i} elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Skeleton variant="text" width="55%" height={24} sx={{ mb: 1 }} />
              <Skeleton variant="rounded" width={130} height={22} sx={{ mb: 1.5 }} />
              <Skeleton variant="text" width="100%" />
              <Skeleton variant="text" width="80%" />
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      {datasets.map((dataset, index) => (
        <Card
          key={index}
          elevation={0}
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            position: "relative",
            transition: "border-color 0.15s, box-shadow 0.15s",
            "&:hover": {
              borderColor: "primary.light",
              boxShadow: "0 2px 8px rgba(61,46,141,0.08)",
            },
          }}
        >
          <CardActionArea onClick={() => onSelect(dataset)} sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 2.5, pr: 6 }}>
              <Typography variant="body1" color="primary" fontWeight={600} sx={{ mb: 1, lineHeight: 1.4 }}>
                {dataset.title}
              </Typography>

              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                <Typography variant="caption" color="text.disabled" sx={{ whiteSpace: "nowrap", fontWeight: 500 }}>
                  Access service:
                </Typography>
                {dataset.accessServiceCategory ? (
                  <Tooltip title={dataset.accessServiceCategory} enterDelay={400}>
                    <Chip
                      label={dataset.accessServiceCategory}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{
                        maxWidth: 180,
                        "& .MuiChip-label": {
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          display: "block",
                        },
                      }}
                    />
                  </Tooltip>
                ) : (
                  <Typography variant="caption" color="text.disabled">Not specified</Typography>
                )}
              </Stack>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  lineHeight: 1.7,
                }}
              >
                {dataset.description ?? "No description available."}
              </Typography>
            </CardContent>
          </CardActionArea>

          {/* Bookmark button */}
          <Tooltip title={isSaved(dataset.title) ? "Remove bookmark" : "Save dataset"}>
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); onToggleSave(dataset); }}
              sx={{
                position: "absolute",
                top: 10,
                right: 10,
                color: isSaved(dataset.title) ? "primary.main" : "text.disabled",
                "&:hover": { color: "primary.main" },
              }}
            >
              {isSaved(dataset.title)
                ? <BookmarkIcon fontSize="small" />
                : <BookmarkBorderIcon fontSize="small" />
              }
            </IconButton>
          </Tooltip>
        </Card>
      ))}
    </Box>
  );
};

export default DatasetListView;