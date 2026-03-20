import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
  Chip,
  Box,
  Link,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import type { Dataset } from "../types/dataset";

interface DescriptionModalProps {
  dataset: Dataset | null;
  onClose: () => void;
}

const DescriptionModal = ({ dataset, onClose }: DescriptionModalProps) => {
  if (!dataset) return null;

  return (
    <Dialog
      open={!!dataset}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="dataset-dialog-title"
    >
      <DialogTitle id="dataset-dialog-title" sx={{ pr: 6 }}>
        <Typography variant="h6" component="span">
          {dataset.title}
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: "absolute", right: 12, top: 12, color: "grey.500" }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {/* Access Service Category badge */}
        {dataset.accessServiceCategory && (
          <Box mb={2}>
            <Chip
              label={dataset.accessServiceCategory}
              color="primary"
              size="small"
              variant="outlined"
            />
          </Box>
        )}

        {/* Full description */}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {dataset.description ?? "No description available."}
        </Typography>

        {/* Access rights link */}
        {dataset.accessRights && (
          <Link
            href={dataset.accessRights}
            target="_blank"
            rel="noopener noreferrer"
            underline="hover"
            sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, fontSize: "0.875rem" }}
          >
            Apply for access
            <OpenInNewIcon sx={{ fontSize: 14 }} />
          </Link>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DescriptionModal;