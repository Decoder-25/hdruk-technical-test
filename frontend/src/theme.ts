import { createTheme } from "@mui/material/styles";

/**
 * MUI theme aligned with HDR UK's brand palette.
 * Primary: HDR UK purple  #3D2E8D
 * Secondary teal accent   #00A8A8
 */
const theme = createTheme({
  palette: {
    primary: {
      main: "#485ea7",
      light: "#6558B1",
      dark: "#485ea7",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#849c9c",
      contrastText: "#ffffff",
    },
    background: {
      default: "#F5F5F7",
      paper: "#ffffff",
    },
  },
  typography: {
    fontFamily: '"DM Sans", sans-serif',
    h4: {
      fontWeight: 700,
      letterSpacing: "-0.5px",
    },
    h6: {
      fontWeight: 600,
    },
    body2: {
      lineHeight: 1.7,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiTableHead: {
      styleOverrides: {
        root: {
          "& .MuiTableCell-head": {
            backgroundColor: "#485ea7",
            color: "#ffffff",
            fontWeight: 600,
            fontSize: "0.875rem",
            letterSpacing: "0.02em",
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:hover": {
            backgroundColor: "#F0EEF8",
            cursor: "pointer",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
  },
});

export default theme;