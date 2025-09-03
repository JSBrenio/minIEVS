import { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import {
  Container,
  Typography,
  Box,
  AppBar,
  Toolbar,
  Tabs,
  Tab,
} from '@mui/material';
import PatientManagement from './components/PatientManagement';
import EligibilityVerification from './components/EligibilityVerification';

const defaultTheme = createTheme();

function App() {
  const [currentTab, setCurrentTab] = useState(0);

  return (
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Insurance Eligibility Verification System
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={currentTab} onChange={(_, newValue) => setCurrentTab(newValue)}>
            <Tab label="Patients" />
            <Tab label="Eligibility" />
          </Tabs>
        </Box>
        {/* Patients Tab */}
        {currentTab === 0 && (
          <PatientManagement />
        )}

        {/* Eligibility Tab */}
        {currentTab === 1 && (
          <EligibilityVerification />
        )}

      </Container>
    </ThemeProvider>
  );
}

export default App;
