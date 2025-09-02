import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  CircularProgress,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import { api } from '../util/api';
import { IEligibilityResult } from '../models';

export default function EligibilityHistory() {
  // State for recent eligibility checks
  const [historyPatientId, setHistoryPatientId] = useState('');
  const [historyLoading, setHistoryLoading] = useState(false);
  const [recentChecks, setRecentChecks] = useState<IEligibilityResult[]>([]);

  const handleHistorySearch = async () => {
    if (!historyPatientId) {
      alert('Please enter a Patient ID to search for recent checks');
      return;
    }

    setHistoryLoading(true);
    try {
      const response = await api.get<IEligibilityResult[]>(`/eligibility/history/${historyPatientId}`);
      setRecentChecks(response.data);
    } catch (error) {
      console.error('Error fetching recent checks:', error);
      setRecentChecks([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'success';
      case 'Inactive': return 'error';
      default: return 'warning';
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Recent Eligibility Checks
        </Typography>
        
        {/* Search Form for Recent Checks */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'end', mb: 3, flexWrap: 'wrap' }}>
          <TextField
            label="Patient ID"
            value={historyPatientId}
            onChange={(e) => setHistoryPatientId(e.target.value)}
            helperText="Enter Patient ID to view recent eligibility checks"
            sx={{ flex: 1, minWidth: 300 }}
          />
          <Button
            variant="outlined"
            startIcon={historyLoading ? <CircularProgress size={20} /> : <HistoryIcon />}
            onClick={handleHistorySearch}
            disabled={!historyPatientId || historyLoading}
            sx={{ marginBottom: 'auto', minWidth: 180, height: 56 }}
          >
            {historyLoading ? 'Loading...' : 'Get Recent Checks'}
          </Button>
        </Box>

        {/* Recent Checks Results */}
        {recentChecks.length > 0 ? (
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Check Date</TableCell>
                  <TableCell>Eligibility ID</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Insurance Company</TableCell>
                  <TableCell>Member ID</TableCell>
                  <TableCell>Coverage Details</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentChecks.map((check) => (
                  <TableRow key={check.eligibilityId} hover>
                    <TableCell>
                      {formatDate(check.checkDateTime)}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">
                        {check.eligibilityId}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={check.status} 
                        color={getStatusColor(check.status) as 'success' | 'error' | 'warning'} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      {check.insuranceCompany || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {check.insuranceMemberId || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {check.coverage ? (
                        <Box>
                          <Typography variant="caption" display="block">
                            Copay: ${check.coverage.copay}
                          </Typography>
                          <Typography variant="caption" display="block">
                            Deductible: ${check.coverage.deductibleMet}/${check.coverage.deductible}
                          </Typography>
                          <Typography variant="caption" display="block">
                            Out-of-Pocket: ${check.coverage.outOfPocketMet}/${check.coverage.outOfPocketMax}
                          </Typography>
                        </Box>
                      ) : (
                        <Box>
                          <Typography variant="body2" color="text.secondary" display="block">
                            No coverage data
                          </Typography>
                          {check.errors && check.errors.length > 0 ? (
                            <Box sx={{ mt: 1 }}>
                              {check.errors.map((error, index) => (
                                <Typography key={index} variant="caption" display="block" color="error">
                                  {error.code}: {error.message}
                                </Typography>
                              ))}
                            </Box>
                          ) : (
                            <Typography variant="caption" display="block" color="text.secondary">
                              No error details available
                            </Typography>
                          )}
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : historyLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
            <CircularProgress />
          </Box>
        ) : historyPatientId ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
            <Typography variant="body2" color="text.secondary">
              No recent eligibility checks found for Patient ID: {historyPatientId}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
            <Typography variant="body2" color="text.secondary">
              Enter a Patient ID above to view recent eligibility checks
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
