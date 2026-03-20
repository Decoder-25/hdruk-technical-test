import {
  Dialog,
  DialogContent,
  Typography,
  IconButton,
  Chip,
  Box,
  Divider,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import LockOpenIcon from "@mui/icons-material/LockOpen";
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
      PaperProps={{ sx: { borderRadius: 2, overflow: "hidden" } }}
    >
      {/* Coloured header band */}
      <Box sx={{ bgcolor: "primary.main", px: 3, pt: 3, pb: 2.5, position: "relative" }}>
        {dataset.accessServiceCategory && (
          <Chip
            label={dataset.accessServiceCategory}
            size="small"
            sx={{
              mb: 1.5,
              bgcolor: "rgba(255,255,255,0.15)",
              color: "white",
              fontWeight: 500,
              fontSize: "0.7rem",
              letterSpacing: "0.04em",
            }}
          />
        )}

        <Typography
          id="dataset-dialog-title"
          variant="h6"
          sx={{ color: "white", fontWeight: 600, lineHeight: 1.3, pr: 5 }}
        >
          {dataset.title}
        </Typography>

        {/* X button — only close control */}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 12,
            top: 12,
            color: "rgba(255,255,255,0.7)",
            "&:hover": { color: "white", bgcolor: "rgba(255,255,255,0.1)" },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <DialogContent sx={{ px: 3, py: 3 }}>
        <Typography
          variant="overline"
          color="text.disabled"
          sx={{ letterSpacing: "0.1em", fontSize: "0.7rem" }}
        >
          Description
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.8 }}>
          {dataset.description ?? "No description available for this dataset."}
        </Typography>

        {dataset.accessRights && (
          <>
            <Divider sx={{ my: 2.5 }} />
            <Typography
              variant="overline"
              color="text.disabled"
              sx={{ letterSpacing: "0.1em", fontSize: "0.7rem" }}
            >
              Data Access
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Button
                variant="contained"
                color="secondary"
                size="small"
                href={dataset.accessRights}
                target="_blank"
                rel="noopener noreferrer"
                startIcon={<LockOpenIcon sx={{ fontSize: 15 }} />}
                endIcon={<OpenInNewIcon sx={{ fontSize: 13 }} />}
                sx={{ textTransform: "none", fontWeight: 600 }}
              >
                Apply for access
              </Button>
            </Box>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DescriptionModal;