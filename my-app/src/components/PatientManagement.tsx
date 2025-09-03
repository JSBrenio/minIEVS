import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Typography,
} from '@mui/material';
import { DataGrid, type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { IPatient } from '../models';
import { api } from '../util/api';
import { formatDateOnly } from '../util';

export default function PatientManagement() {
  const [patients, setPatients] = useState<IPatient[]>([]);
  const [patientDialogOpen, setPatientDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<IPatient | null>(null);
  const [patientFormData, setPatientFormData] = useState<IPatient>({
    patientId: '',
    patientName: '',
    dateOfBirth: '',
  });

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await api.get('/patients/');
        setPatients(response.data.data);
      } catch (error) {
        console.error('Error fetching patients:', error);
      }
    };

    fetchPatients();
  }, []);

  const patientColumns: GridColDef[] = [
    { field: 'patientId', headerName: 'Patient ID', width: 150 },
    { field: 'patientName', headerName: 'Patient Name', width: 200 },
    { 
      field: 'dateOfBirth', 
      headerName: 'Date of Birth', 
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <span>{formatDateOnly(params.value as string)}</span>
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <IconButton size="small" onClick={() => handleEditPatient(params.row as IPatient)}>
            <EditIcon />
          </IconButton>
          <IconButton size="small" onClick={() => handleDeletePatient(params.row.patientId as string)}>
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  const handleAddPatient = () => {
    setEditingPatient(null);
    setPatientFormData({
      patientId: '',
      patientName: '',
      dateOfBirth: '',
    });
    setPatientDialogOpen(true);
  };

  const handleEditPatient = (patient: IPatient) => {
    setEditingPatient(patient);
    setPatientFormData({ ...patient });
    setPatientDialogOpen(true);
  };

  const handleDeletePatient = async (patientId: string) => {
    try {
      await api.delete(`/patients/${patientId}`);
      const updatedPatients = patients.filter(patient => patient.patientId !== patientId);
      setPatients(updatedPatients);
    } catch (error) {
      console.error('Error deleting patient:', error);
      alert('Failed to delete patient. Please try again.');
    }
  };

  const handleSavePatient = async () => {
    try {
      if (editingPatient) {
        // Update existing patient
        await api.put(`/patients/${editingPatient.patientId}`, patientFormData);
        const updatedPatients = patients.map(patient => 
          patient.patientId === editingPatient.patientId ? { ...patientFormData } : patient
        );
        setPatients(updatedPatients);
      } else {
        // Create new patient
        const response = await api.post<IPatient>('/patients', patientFormData);
        const newPatient = response.data;
        setPatients([...patients, newPatient]);
      }
      setPatientDialogOpen(false);
    } catch (error) {
      console.error('Error saving patient:', error);
      alert('Failed to save patient. Please try again.');
    }
  };

  const handlePatientInputChange = (field: keyof IPatient) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setPatientFormData({ ...patientFormData, [field]: event.target.value });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Patient Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddPatient}
        >
          Add Patient
        </Button>
      </Box>

      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          getRowId={(row) => row.patientId}
          rows={patients}
          columns={patientColumns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          pageSizeOptions={[10, 25]}
          checkboxSelection
          disableRowSelectionOnClick
        />
      </Box>

      {/* Patient Dialog */}
      <Dialog open={patientDialogOpen} onClose={() => setPatientDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingPatient ? 'Edit Patient' : 'Add New Patient'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Patient ID"
              fullWidth
              value={patientFormData.patientId}
              onChange={handlePatientInputChange('patientId')}
              required
            />
            <TextField
              autoFocus
              label="Patient Name"
              fullWidth
              value={patientFormData.patientName}
              onChange={handlePatientInputChange('patientName')}
              required
              helperText="Enter the full name of the patient"
            />
            <TextField
              label="Date of Birth"
              type="date"
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              value={patientFormData.dateOfBirth}
              onChange={handlePatientInputChange('dateOfBirth')}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPatientDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSavePatient} variant="contained">
            {editingPatient ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
