import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Alert,
  CircularProgress,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Divider,
  Tabs,
  Tab,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { api } from '../util/api';
import { IEligibilityCheck, IEligibilityResult } from '../models';
import EligibilityHistory from './EligibilityHistory';

export default function EligibilityVerification() {
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState<IEligibilityCheck>({
    patientId: '',
    patientName: '',
    dateOfBirth: '',
    insuranceMemberId: '',
    insuranceCompany: '',
    serviceDate: new Date().toISOString().split('T')[0], // Default to today's date
  });
  const [eligibilityLoading, setEligibilityLoading] = useState(false);
  const [eligibilityResult, setEligibilityResult] = useState<IEligibilityResult | null>(null);

  // Common insurance companies for the select dropdown
  const insuranceCompanies = [
    'UnitedHealthCare',
    'Elevance Health', 
    'Kaiser Permanente',
    'Cigna',
    'Molina Healthcare',
    'BlueCross BlueShield',
    'other'
  ];

  const handleInputChange = (field: keyof IEligibilityCheck) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { value: string } }) => {
    setFormData({ ...formData, [field]: event.target.value });
  };

  const isFormValid = () => {
    return formData.patientId && formData.patientName && formData.dateOfBirth && formData.serviceDate;
  };

  const handleEligibilitySearch = async () => {
    if (!isFormValid()) {
      alert('Please fill in all required fields (Patient ID, Patient Name, Date of Birth, and Service Date)');
      return;
    }

    setEligibilityLoading(true);
    try {
      // Create the eligibility check request payload with service date as ISO timestamp
      const checkData: IEligibilityCheck = {
        ...formData,
        serviceDate: new Date(formData.serviceDate).toISOString(),
        // Ensure optional fields are either filled or undefined
        insuranceMemberId: formData.insuranceMemberId || undefined,
        insuranceCompany: formData.insuranceCompany || undefined,
      };

      const response = await api.post<IEligibilityResult>(`eligibility/check`, checkData);
      setEligibilityResult(response.data);
    } catch (error) {
      console.error('Error checking eligibility:', error);
      // Create a fallback error result
      setEligibilityResult({
        eligibilityId: '',
        patientId: formData.patientId,
        checkDateTime: new Date().toISOString(),
        status: 'Unknown',
        errors: [{ code: 'API_ERROR', message: 'Failed to check eligibility' }]
      });
    } finally {
      setEligibilityLoading(false);
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

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Eligibility Verification
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="eligibility verification tabs">
          <Tab label="Check Eligibility" />
          <Tab label="Eligibility History" />
        </Tabs>
      </Box>

      {tabValue === 0 && (
        <Box>
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6">
                Check Patient Eligibility
              </Typography>
              
              {/* Required Fields Row */}
              <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <TextField
                  label="Patient ID"
                  value={formData.patientId}
                  onChange={handleInputChange('patientId')}
                  required
                  sx={{ flex: 1, minWidth: 200 }}
                />
                <TextField
                  label="Patient Name"
                  value={formData.patientName}
                  onChange={handleInputChange('patientName')}
                  required
                  sx={{ flex: 1, minWidth: 200 }}
                />
                <TextField
                  label="Date of Birth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange('dateOfBirth')}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  required
                  sx={{ flex: 1, minWidth: 200 }}
                />
              </Box>

              {/* Optional Insurance Fields Row */}
              <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <TextField
                  label="Insurance Member ID"
                  value={formData.insuranceMemberId}
                  onChange={handleInputChange('insuranceMemberId')}
                  helperText="Optional - May differ from Patient ID"
                  sx={{ flex: 1, minWidth: 250 }}
                />
                <FormControl sx={{ flex: 1, minWidth: 250 }}>
                  <InputLabel>Insurance Company</InputLabel>
                  <Select
                    value={formData.insuranceCompany}
                    onChange={handleInputChange('insuranceCompany')}
                    label="Insurance Company"
                  >
                    <MenuItem value="">
                      <em>Select Insurance Company</em>
                    </MenuItem>
                    {insuranceCompanies.map((company) => (
                      <MenuItem key={company} value={company}>
                        {company}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* Service Date and Submit Button Row */}
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'end', mb: 3, flexWrap: 'wrap' }}>
                <TextField
                  label="Service Date"
                  type="date"
                  value={formData.serviceDate}
                  onChange={handleInputChange('serviceDate')}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  helperText="Date of the service requiring eligibility verification"
                  required
                  sx={{ flex: 1, minWidth: 250 }}
                />
                <Button
                  variant="contained"
                  size="large"
                  startIcon={eligibilityLoading ? <CircularProgress size={20} /> : <SearchIcon />}
                  onClick={handleEligibilitySearch}
                  disabled={!isFormValid() || eligibilityLoading}
                  sx={{ marginBottom: 'auto', minWidth: 200, height: 56 }}
                >
                  {eligibilityLoading ? 'Checking...' : 'Check Eligibility'}
                </Button>
              </Box>
              
              {eligibilityResult && (
                <Box sx={{ mt: 3 }}>
                  <Alert 
                    severity={eligibilityResult.status === 'Active' ? 'success' : 'error'}
                    sx={{ mb: 2 }}
                  >
                    {eligibilityResult.status === 'Active' 
                      ? 'Patient eligibility verified - Coverage is active' 
                      : eligibilityResult.errors?.[0]?.message || `Eligibility status: ${eligibilityResult.status}`
                    }
                  </Alert>

                  {/* Complete Eligibility Result Data */}
                  <Card variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Complete Eligibility Data
                      </Typography>
                      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2 }}>
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">
                            Eligibility ID
                          </Typography>
                          <Typography variant="body1">
                            {eligibilityResult.eligibilityId || 'N/A'}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">
                            Patient ID
                          </Typography>
                          <Typography variant="body1">
                            {eligibilityResult.patientId}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">
                            Check Date & Time
                          </Typography>
                          <Typography variant="body1">
                            {formatDate(eligibilityResult.checkDateTime)}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">
                            Insurance Member ID
                          </Typography>
                          <Typography variant="body1">
                            {eligibilityResult.insuranceMemberId || 'N/A'}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">
                            Insurance Company
                          </Typography>
                          <Typography variant="body1">
                            {eligibilityResult.insuranceCompany || 'N/A'}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">
                            Status
                          </Typography>
                          <Chip 
                            label={eligibilityResult.status} 
                            color={getStatusColor(eligibilityResult.status) as 'success' | 'error' | 'warning'} 
                            size="small" 
                          />
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>

                  {/* Coverage Details and Calculated Values */}
                  {eligibilityResult.status === 'Active' && eligibilityResult.coverage && (
                    <Card variant="outlined" sx={{ mb: 2 }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Coverage Details & Calculations
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 2 }}>
                          <Card variant="outlined" sx={{ minWidth: 200 }}>
                            <CardContent>
                              <Typography color="text.secondary" gutterBottom>
                                Copay
                              </Typography>
                              <Typography variant="h5" component="div">
                                ${eligibilityResult.coverage.copay}
                              </Typography>
                            </CardContent>
                          </Card>

                          <Card variant="outlined" sx={{ minWidth: 200 }}>
                            <CardContent>
                              <Typography color="text.secondary" gutterBottom>
                                Deductible Remaining
                              </Typography>
                              <Typography variant="h5" component="div">
                                ${eligibilityResult.coverage.deductible - eligibilityResult.coverage.deductibleMet}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                ${eligibilityResult.coverage.deductibleMet} of ${eligibilityResult.coverage.deductible} met
                              </Typography>
                            </CardContent>
                          </Card>

                          <Card variant="outlined" sx={{ minWidth: 200 }}>
                            <CardContent>
                              <Typography color="text.secondary" gutterBottom>
                                Out-of-Pocket Remaining
                              </Typography>
                              <Typography variant="h5" component="div">
                                ${eligibilityResult.coverage.outOfPocketMax - eligibilityResult.coverage.outOfPocketMet}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                ${eligibilityResult.coverage.outOfPocketMet} of ${eligibilityResult.coverage.outOfPocketMax} met
                              </Typography>
                            </CardContent>
                          </Card>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        {/* Raw Coverage Data */}
                        <Typography variant="subtitle1" gutterBottom>
                          Raw Coverage Data
                        </Typography>
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                          <Box>
                            <Typography variant="subtitle2" color="text.secondary">
                              Total Deductible
                            </Typography>
                            <Typography variant="body1">
                              ${eligibilityResult.coverage.deductible}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="subtitle2" color="text.secondary">
                              Deductible Met
                            </Typography>
                            <Typography variant="body1">
                              ${eligibilityResult.coverage.deductibleMet}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="subtitle2" color="text.secondary">
                              Copay Amount
                            </Typography>
                            <Typography variant="body1">
                              ${eligibilityResult.coverage.copay}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="subtitle2" color="text.secondary">
                              Out-of-Pocket Max
                            </Typography>
                            <Typography variant="body1">
                              ${eligibilityResult.coverage.outOfPocketMax}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="subtitle2" color="text.secondary">
                              Out-of-Pocket Met
                            </Typography>
                            <Typography variant="body1">
                              ${eligibilityResult.coverage.outOfPocketMet}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  )}

                  {/* Errors Section */}
                  {eligibilityResult.errors && eligibilityResult.errors.length > 0 && (
                    <Card variant="outlined" sx={{ mb: 2 }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom color="error">
                          Errors
                        </Typography>
                        {eligibilityResult.errors.map((error, index) => (
                          <Alert key={index} severity="error" sx={{ mb: 1 }}>
                            <Typography variant="subtitle2">
                              {error.code}
                            </Typography>
                            <Typography variant="body2">
                              {error.message}
                            </Typography>
                          </Alert>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      )}

      {tabValue === 1 && (
        <EligibilityHistory />
      )}
    </Box>
  );
}
