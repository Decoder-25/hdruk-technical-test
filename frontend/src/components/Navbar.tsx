import { AppBar, Toolbar, Box, Typography, IconButton, Badge, Tooltip } from "@mui/material";
import BookmarkIcon from "@mui/icons-material/Bookmark";

interface NavbarProps {
  savedCount: number;
  onOpenSaved: () => void;
}

const Navbar = ({ savedCount, onOpenSaved }: NavbarProps) => {
  return (
    <AppBar position="static" elevation={0} sx={{ borderBottom: "1px solid", borderColor: "rgba(255,255,255,0.15)" }}>
      <Toolbar sx={{ gap: 1 }}>
        {/* Logo mark */}
        <Box sx={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", mr: 1 }}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M4 8 L16 4 L28 8 L28 20 L16 28 L4 20 Z" fill="rgba(255,255,255,0.15)" stroke="white" strokeWidth="1.5"/>
            <path d="M10 16 L15 11 L22 16 L15 21 Z" fill="white"/>
          </svg>
        </Box>

        {/* Brand name */}
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="body1" sx={{ fontWeight: 700, lineHeight: 1.1, letterSpacing: "-0.2px", color: "white" }}>
            Health Data Research
          </Typography>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)", letterSpacing: "0.05em", textTransform: "uppercase", fontSize: "0.65rem" }}>
            UK Gateway
          </Typography>
        </Box>

        {/* Saved datasets bookmark button with badge */}
        <Tooltip title={savedCount > 0 ? `${savedCount} saved dataset${savedCount !== 1 ? "s" : ""}` : "No saved datasets"}>
          <IconButton onClick={onOpenSaved} sx={{ color: "white" }}>
            <Badge
              badgeContent={savedCount}
              color="secondary"
              max={99}
            >
              <BookmarkIcon />
            </Badge>
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;