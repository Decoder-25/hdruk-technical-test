import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme";
import HomePage from "./pages/HomePage";

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      {/* CssBaseline normalises browser defaults and applies MUI background */}
      <CssBaseline />
      <HomePage />
    </ThemeProvider>
  );
};

export default App;