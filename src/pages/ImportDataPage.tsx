import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  CloudUpload,
  ArrowBack,
  CheckCircle,
  Warning,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../config/axiosConfig';

interface FileData {
  filename: string;
  headers: string[];
  preview: Record<string, any>[];
  totalRows: number;
  data: Record<string, any>[];
  error?: string;
}

interface ContactField {
  value: string;
  label: string;
}

const steps = ['Upload Files', 'Map Fields', 'Import Data'];

const ImportDataPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [files, setFiles] = useState<FileData[]>([]);
  const [contactFields, setContactFields] = useState<ContactField[]>([]);
  const [mappings, setMappings] = useState<Record<string, string>[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [importResults, setImportResults] = useState<any>(null);

  useEffect(() => {
    fetchContactFields();
  }, []);

  const fetchContactFields = async () => {
    try {
      const response = await api.get('/contacts/fields');
      setContactFields(response.data.fields);
    } catch (err) {
      console.error('Error fetching contact fields:', err);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    setLoading(true);
    setError('');

    const formData = new FormData();
    Array.from(selectedFiles).forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await api.post('/import/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const uploadedFiles = response.data.files.filter((file: FileData) => !file.error);
      const errorFiles = response.data.files.filter((file: FileData) => file.error);

      if (errorFiles.length > 0) {
        setError(`Some files could not be processed: ${errorFiles.map(f => f.filename).join(', ')}`);
      }

      if (uploadedFiles.length > 0) {
        setFiles(uploadedFiles);
        // Initialize mappings for each file
        const initialMappings = uploadedFiles.map((file: FileData) => {
          const mapping: Record<string, string> = {};
          file.headers.forEach(header => {
            mapping[header] = '-- Ignore --';
          });
          return mapping;
        });
        setMappings(initialMappings);
        setActiveStep(1);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to upload files');
    } finally {
      setLoading(false);
    }
  };

  const handleMappingChange = (fileIndex: number, header: string, value: string) => {
    const newMappings = [...mappings];
    newMappings[fileIndex][header] = value;
    setMappings(newMappings);
  };

  const handleImport = async () => {
    setLoading(true);
    setError('');

    try {
      const importData = {
        files: files.map(file => file.data),
        mappings: mappings,
      };

      const response = await api.post('/contacts/import', importData);
      setImportResults(response.data);
      setSuccess(`Import completed! ${response.data.total_imported} contacts imported.`);
      setActiveStep(2);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return (
          <Card>
            <CardContent>
              <Box textAlign="center" py={4}>
                <CloudUpload sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Upload CSV or Excel Files
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  Select one or more CSV or Excel files to import contact data
                </Typography>
                <input
                  accept=".csv,.xlsx,.xls"
                  style={{ display: 'none' }}
                  id="file-upload"
                  multiple
                  type="file"
                  onChange={handleFileUpload}
                  disabled={loading}
                />
                <label htmlFor="file-upload">
                  <Button
                    variant="contained"
                    component="span"
                    disabled={loading}
                    size="large"
                  >
                    {loading ? <CircularProgress size={24} /> : 'Choose Files'}
                  </Button>
                </label>
              </Box>
            </CardContent>
          </Card>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Map Your Data Fields
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Map each column from your files to the corresponding CRM fields
            </Typography>

            {files.map((file, fileIndex) => (
              <Card key={fileIndex} sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {file.filename} ({file.totalRows} rows)
                  </Typography>

                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" gutterBottom>
                        Field Mapping
                      </Typography>
                      {file.headers.map((header) => (
                        <Box key={header} display="flex" alignItems="center" mb={1}>
                          <Box minWidth={120}>
                            <Chip label={header} size="small" />
                          </Box>
                          <Box mx={2}>→</Box>
                          <FormControl size="small" sx={{ minWidth: 200 }}>
                            <Select
                              value={mappings[fileIndex]?.[header] || '-- Ignore --'}
                              onChange={(e) => handleMappingChange(fileIndex, header, e.target.value)}
                            >
                              <MenuItem value="-- Ignore --">-- Ignore --</MenuItem>
                              {contactFields.map((field) => (
                                <MenuItem key={field.value} value={field.value}>
                                  {field.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Box>
                      ))}
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" gutterBottom>
                        Data Preview
                      </Typography>
                      <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              {file.headers.map((header) => (
                                <TableCell key={header}>{header}</TableCell>
                              ))}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {file.preview.slice(0, 3).map((row, rowIndex) => (
                              <TableRow key={rowIndex}>
                                {file.headers.map((header) => (
                                  <TableCell key={header}>
                                    {row[header] || ''}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}

            <Box display="flex" justifyContent="space-between" mt={3}>
              <Button
                onClick={() => setActiveStep(0)}
                disabled={loading}
              >
                Back
              </Button>
              <Button
                variant="contained"
                onClick={handleImport}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Import Data'}
              </Button>
            </Box>
          </Box>
        );

      case 2:
        return (
          <Card>
            <CardContent>
              <Box textAlign="center" py={4}>
                <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Import Complete!
                </Typography>
                {importResults && (
                  <Box>
                    <Typography variant="body1" paragraph>
                      Successfully imported {importResults.total_imported} contacts
                    </Typography>
                    {importResults.errors && importResults.errors.length > 0 && (
                      <Box mt={2}>
                        <Alert severity="warning">
                          <Typography variant="subtitle2" gutterBottom>
                            Some rows had errors:
                          </Typography>
                          <Box component="ul" sx={{ textAlign: 'left', mt: 1 }}>
                            {importResults.errors.slice(0, 5).map((error: string, index: number) => (
                              <li key={index}>{error}</li>
                            ))}
                            {importResults.errors.length > 5 && (
                              <li>... and {importResults.errors.length - 5} more</li>
                            )}
                          </Box>
                        </Alert>
                      </Box>
                    )}
                  </Box>
                )}
                <Box mt={3}>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/contacts')}
                    sx={{ mr: 2 }}
                  >
                    View Contacts
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setActiveStep(0);
                      setFiles([]);
                      setMappings([]);
                      setImportResults(null);
                      setSuccess('');
                      setError('');
                    }}
                  >
                    Import More
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/contacts')}
            sx={{ mb: 2 }}
          >
            Back to Contacts
          </Button>
          <Typography variant="h4" gutterBottom>
            Import Contact Data
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Upload and import contact data from CSV or Excel files
          </Typography>
        </Box>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      {loading && activeStep === 1 && (
        <Box sx={{ mb: 2 }}>
          <LinearProgress />
        </Box>
      )}

      {renderStep()}
    </Box>
  );
};

export default ImportDataPage;