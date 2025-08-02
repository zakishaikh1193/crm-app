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
  Chip,
  LinearProgress,
  Fade,
  Slide,
  Grow,
  Avatar,
  Tooltip,
  useTheme,
  useMediaQuery,
  Divider,
  Paper,
} from '@mui/material';
import {
  CloudUpload,
  ArrowBack,
  CheckCircle,
  Upload,
  Settings,
  DataUsage,
  FileUpload,
  Assignment,
  PlayArrow,
  Refresh,
  Clear,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
// @ts-ignore
import api from '../config/axiosConfig';
import Autocomplete, { AutocompleteRenderInputParams } from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { SyntheticEvent } from 'react';

interface FileData {
  filename: string;
  path?: string;
  size?: number;
  mimetype?: string;
  headers?: string[];
  preview?: Record<string, any>[];
  totalRows?: number;
  data?: Record<string, any>[];
  error?: string;
}

interface ContactField {
  value: string;
  label: string;
  group?: string;
}

const steps = ['Upload Files', 'Map Fields', 'Import Data'];

const ImportDataPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [activeStep, setActiveStep] = useState(0);
  const [files, setFiles] = useState<FileData[]>([]);
  const [contactFields, setContactFields] = useState<ContactField[]>([]);
  const [mappings, setMappings] = useState<Record<string, string>[]>([]);
  const [usedFields, setUsedFields] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [importResults, setImportResults] = useState<any>(null);
  const [importProgress, setImportProgress] = useState(0);
  const [importStatus, setImportStatus] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');

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
    setUploadProgress(0);
    setUploadStatus('Uploading files...');

    const formData = new FormData();
    Array.from(selectedFiles).forEach(file => {
      formData.append('files', file);
    });

    try {
      // Step 1: Upload files (fast)
      const uploadResponse = await api.post('/import/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 0, // No timeout - unlimited upload time
        onUploadProgress: (progressEvent: any) => {
          if (progressEvent.total) {
            const progress = (progressEvent.loaded / progressEvent.total) * 100;
            setUploadProgress(progress);
            setUploadStatus(`Uploading files... ${Math.round(progress)}%`);
          }
        },
      });

      setUploadProgress(100);
      setUploadStatus('Getting file previews...');

      // Step 2: Get previews for each file (separate requests)
      const uploadedFiles = uploadResponse.data.files;
      const fileDetails: FileData[] = [];

      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i];
        setUploadStatus(`Getting preview for ${file.filename}...`);
        
        try {
          const previewResponse = await api.post('/import/preview', {
            filePath: file.path
          });
          
          fileDetails.push({
            filename: file.filename,
            path: file.path,
            size: file.size,
            mimetype: file.mimetype,
            headers: previewResponse.data.headers,
            preview: previewResponse.data.preview,
            totalRows: previewResponse.data.totalRows
          });
        } catch (previewError: any) {
          console.error(`Error getting preview for ${file.filename}:`, previewError);
          fileDetails.push({
            filename: file.filename,
            path: file.path,
            size: file.size,
            mimetype: file.mimetype,
            error: previewError.response?.data?.error || 'Failed to get preview'
          });
        }
      }

      const errorFiles = fileDetails.filter((file: FileData) => file.error);

      if (errorFiles.length > 0) {
        setError(`Some files could not be processed: ${errorFiles.map((f: FileData) => f.filename).join(', ')}`);
      }

      const validFiles = fileDetails.filter((file: FileData) => !file.error && file.headers);
      
      if (validFiles.length > 0) {
        setFiles(validFiles);
        // Initialize mappings for each file
        const initialMappings = validFiles.map((file: FileData) => {
          const mapping: Record<string, string> = {};
          file.headers!.forEach(header => {
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
      setUploadProgress(0);
      setUploadStatus('');
    }
  };

  const handleMappingChange = (fileIndex: number, header: string, value: string) => {
    const newMappings = [...mappings];
    const previousValue = newMappings[fileIndex][header];
    
    // Update the mapping
    newMappings[fileIndex][header] = value;
    setMappings(newMappings);
    
    // Update used fields
    setUsedFields(prevUsedFields => {
      const newUsedFields = new Set(prevUsedFields);
      
      // Remove the previous mapping
      if (previousValue && previousValue !== '-- Ignore --') {
        newUsedFields.delete(previousValue);
      }
      
      // Add the new mapping if it's not "Ignore"
      if (value && value !== '-- Ignore --') {
        newUsedFields.add(value);
      }
      
      return newUsedFields;
    });
  };

  const handleImport = async () => {
    setLoading(true);
    setError('');
    setImportProgress(0);
    setImportStatus('Starting import...');

    try {
      const importData = {
        files: files.map(file => ({
          filename: file.filename,
          path: file.path
        })),
        mappings: mappings,
      };

      // Calculate total rows for progress tracking
      const totalRows = files.reduce((sum, file) => sum + (file.totalRows || 0), 0);
      let processedRows = 0;

      // Simulate progress updates with faster updates
      const progressInterval = setInterval(() => {
        if (processedRows < totalRows) {
          processedRows += Math.floor(totalRows / 50); // Update every 2%
          const progress = Math.min((processedRows / totalRows) * 100, 90); // Cap at 90% until complete
          setImportProgress(progress);
          setImportStatus(`Processing ${processedRows} of ${totalRows} rows...`);
        }
      }, 500); // Update every 500ms instead of 1000ms

      const response = await api.post('/contacts/import-from-files', importData);
      
      clearInterval(progressInterval);
      setImportProgress(100);
      setImportStatus('Import completed!');
      
      setImportResults(response.data);
      setSuccess(`Import completed! ${response.data.total_imported} contacts imported.`);
      setActiveStep(2);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Import failed');
    } finally {
      setLoading(false);
      setImportProgress(0);
      setImportStatus('');
    }
  };

  // Group fields by category for better UX
  const groupField = (field: ContactField): string => {
    return field.group || 'Other';
  };

  // Get available fields for selection (excluding already used ones)
  const getAvailableFields = (currentValue: string) => {
    return contactFields.filter(field => 
      field.value === currentValue || !usedFields.has(field.value)
    );
  };

  // Auto-match logic: when files are uploaded, try to auto-map headers to CRM fields
  useEffect(() => {
    if (files.length > 0 && contactFields.length > 0 && mappings.length === 0) {
      const initialMappings = files.map((file: FileData) => {
        const mapping: Record<string, string> = {};
        const used = new Set<string>();
        
        file.headers?.forEach(header => {
          // Try to find a field with a similar name that hasn't been used yet
          const match = contactFields.find(f =>
            !used.has(f.value) && (
              f.value.toLowerCase() === header.toLowerCase() ||
              f.label.toLowerCase() === header.toLowerCase() ||
              f.value.replace(/_/g, '').toLowerCase() === header.replace(/\s/g, '').toLowerCase()
            )
          );
          
          if (match) {
            mapping[header] = match.value;
            used.add(match.value);
          } else {
            mapping[header] = '-- Ignore --';
          }
        });
        
        // Update used fields
        setUsedFields(prev => new Set([...prev, ...used]));
        return mapping;
      });
      
      setMappings(initialMappings);
    }
    // eslint-disable-next-line
  }, [files, contactFields]);

  // Quick action handlers
  const handleMapAllIgnore = (fileIndex: number) => {
    const newMappings = [...mappings];
    const fieldsToRemove = new Set<string>();
    
    // First collect all fields that will be removed
    Object.keys(newMappings[fileIndex]).forEach(header => {
      const currentValue = newMappings[fileIndex][header];
      if (currentValue !== '-- Ignore --') {
        fieldsToRemove.add(currentValue);
      }
      newMappings[fileIndex][header] = '-- Ignore --';
    });
    
    // Update used fields by removing the ones we just unmapped
    setUsedFields(prev => {
      const newUsed = new Set(prev);
      fieldsToRemove.forEach(field => newUsed.delete(field));
      return newUsed;
    });
    
    setMappings(newMappings);
  };
  const handleResetMappings = (fileIndex: number) => {
    const newMappings = [...mappings];
    const usedInThisReset = new Set<string>();
    
    // First, clear all current mappings for this file
    Object.keys(newMappings[fileIndex]).forEach(header => {
      const currentValue = newMappings[fileIndex][header];
      if (currentValue !== '-- Ignore --') {
        usedInThisReset.add(currentValue);
      }
      
      // Try to auto-match again, but only with fields not already used
      const match = contactFields.find(f =>
        !usedFields.has(f.value) && !usedInThisReset.has(f.value) && (
          f.value.toLowerCase() === header.toLowerCase() ||
          f.label.toLowerCase() === header.toLowerCase() ||
          f.value.replace(/_/g, '').toLowerCase() === header.replace(/\s/g, '').toLowerCase()
        )
      );
      
      if (match) {
        newMappings[fileIndex][header] = match.value;
        usedInThisReset.add(match.value);
      } else {
        newMappings[fileIndex][header] = '-- Ignore --';
      }
    });
    
    // Update the used fields with our new mappings
    setUsedFields(prev => new Set([...prev, ...usedInThisReset]));
    setMappings(newMappings);
  };
  const handleApplyMappingToAll = (fileIndex: number) => {
    const newMappings = [...mappings];
    for (let i = 0; i < newMappings.length; i++) {
      if (i !== fileIndex) {
        newMappings[i] = { ...newMappings[fileIndex] };
      }
    }
    setMappings(newMappings);
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
      {/* Header */}
      <Fade in={true} timeout={800}>
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 800,
              background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1,
            }}
          >
            Import Data
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#64748b',
              fontWeight: 500,
            }}
          >
            Import contacts from CSV files into your CRM system
          </Typography>
        </Box>
      </Fade>

      {/* Stepper */}
      <Grow in={true} timeout={1000}>
        <Card
          sx={{
            backdropFilter: 'blur(16px)',
            background: 'rgba(255, 255, 255, 0.85)',
            borderRadius: 4,
            boxShadow: '0 12px 24px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(255,255,255,0.2)',
            mb: 4,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.12)',
            },
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Stepper 
              activeStep={activeStep} 
              alternativeLabel
              sx={{
                '& .MuiStepLabel-root .Mui-completed': {
                  color: '#10b981',
                },
                '& .MuiStepLabel-root .Mui-active': {
                  color: '#6366f1',
                },
                '& .MuiStepLabel-label': {
                  fontWeight: 600,
                },
              }}
            >
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </CardContent>
        </Card>
      </Grow>

      {/* Error Alert */}
      {error && (
        <Slide direction="down" in={true} timeout={300}>
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: 2,
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
            }}
          >
            {error}
          </Alert>
        </Slide>
      )}

      {/* Success Alert */}
      {success && (
        <Slide direction="down" in={true} timeout={300}>
          <Alert 
            severity="success" 
            sx={{ 
              mb: 3,
              borderRadius: 2,
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
            }}
          >
            {success}
          </Alert>
        </Slide>
      )}

      {/* Step Content */}
      <Grow in={true} timeout={1200}>
        <Box>
          {activeStep === 0 && (
            <Card
              sx={{
                backdropFilter: 'blur(16px)',
                background: 'rgba(255, 255, 255, 0.85)',
                borderRadius: 4,
                boxShadow: '0 12px 24px rgba(0, 0, 0, 0.08)',
                border: '1px solid rgba(255,255,255,0.2)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.12)',
                },
              }}
            >
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 24px',
                    boxShadow: '0 10px 30px rgba(99, 102, 241, 0.3)',
                  }}
                >
                  <CloudUpload sx={{ fontSize: 60, color: 'white' }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                  Upload CSV Files
                </Typography>
                <Typography variant="body1" sx={{ color: '#64748b', mb: 4 }}>
                  Select one or more CSV files to import contacts into your CRM system.
                </Typography>
                
                {loading && (
                  <Box sx={{ width: '100%', maxWidth: 400, mb: 3 }}>
                    <Typography variant="body2" sx={{ textAlign: 'center', mb: 1, color: '#64748b' }}>
                      {uploadStatus}
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={uploadProgress} 
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 4,
                          background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                        },
                      }}
                    />
                    <Typography variant="caption" sx={{ textAlign: 'center', mt: 1, color: '#64748b' }}>
                      {Math.round(uploadProgress)}% complete
                    </Typography>
                  </Box>
                )}
                
                <input
                  accept=".csv,.xlsx,.xls"
                  style={{ display: 'none' }}
                  id="file-upload"
                  multiple
                  type="file"
                  onChange={handleFileUpload}
                />
                <label htmlFor="file-upload">
                  <Button
                    component="span"
                    variant="contained"
                    size="large"
                    startIcon={<Upload />}
                    disabled={loading}
                    sx={{
                      background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                      boxShadow: '0 8px 25px rgba(99, 102, 241, 0.3)',
                      py: 2,
                      px: 4,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      '&:hover': {
                        background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
                        boxShadow: '0 12px 35px rgba(99, 102, 241, 0.4)',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Choose Files'}
                  </Button>
                </label>
              </CardContent>
            </Card>
          )}

          {activeStep === 1 && (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  Map Fields
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<ArrowBack />}
                  onClick={() => setActiveStep(0)}
                  sx={{
                    borderWidth: '2px',
                    '&:hover': {
                      borderWidth: '2px',
                      background: 'rgba(99, 102, 241, 0.04)',
                    },
                  }}
                >
                  Back to Upload
                </Button>
              </Box>

              {files.map((file, fileIndex) => (
                <Slide direction="up" in={true} timeout={300 + fileIndex * 200} key={fileIndex}>
                  <Card
                    sx={{
                      backdropFilter: 'blur(16px)',
                      background: 'rgba(255, 255, 255, 0.85)',
                      borderRadius: 4,
                      boxShadow: '0 12px 24px rgba(0, 0, 0, 0.08)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      mb: 3,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.12)',
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box display="flex" alignItems="center" mb={3}>
                        <Avatar
                          sx={{
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            mr: 2,
                          }}
                        >
                          <FileUpload />
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {file.filename}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#64748b' }}>
                            {file.totalRows} rows, {file.headers?.length || 0} columns
                          </Typography>
                        </Box>
                        <Box display="flex" gap={1}>
                          <Tooltip title="Reset Mappings">
                            <Button
                              size="small"
                              startIcon={<Refresh />}
                              onClick={() => handleResetMappings(fileIndex)}
                              sx={{ color: '#f59e0b' }}
                            >
                              Reset
                            </Button>
                          </Tooltip>
                          <Tooltip title="Ignore All Fields">
                            <Button
                              size="small"
                              startIcon={<Clear />}
                              onClick={() => handleMapAllIgnore(fileIndex)}
                              sx={{ color: '#ef4444' }}
                            >
                              Ignore All
                            </Button>
                          </Tooltip>
                          <Tooltip title="Apply this mapping to all files with matching headers">
                            <Button
                              size="small"
                              startIcon={<Settings />}
                              onClick={() => handleApplyMappingToAll(fileIndex)}
                              sx={{ color: '#6366f1' }}
                            >
                              Apply to All
                            </Button>
                          </Tooltip>
                        </Box>
                      </Box>

                      <Grid container spacing={2}>
                        {file.headers?.map((header, headerIndex) => (
                          <Grid item xs={12} sm={6} md={4} key={headerIndex}>
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#1e293b' }}>
                                {header}
                              </Typography>
                              <Autocomplete
                                options={[
                                  { value: '-- Ignore --', label: '-- Ignore --' },
                                  ...getAvailableFields(mappings[fileIndex][header])
                                ]}
                                value={
                                  mappings[fileIndex][header] === '-- Ignore --' 
                                    ? { value: '-- Ignore --', label: '-- Ignore --' }
                                    : contactFields.find(f => f.value === mappings[fileIndex][header]) || 
                                      { value: mappings[fileIndex][header], label: mappings[fileIndex][header] }
                                }
                                onChange={(_, newValue) => {
                                  handleMappingChange(
                                    fileIndex,
                                    header,
                                    newValue?.value || '-- Ignore --'
                                  );
                                }}
                                groupBy={(option) => groupField(option)}
                                getOptionLabel={(option) => option.label || option.value}
                                getOptionDisabled={(option) => 
                                  option.value !== '-- Ignore --' && 
                                  option.value !== mappings[fileIndex][header] && 
                                  usedFields.has(option.value)
                                }
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                  />
                                )}
                              />
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </CardContent>
                  </Card>
                </Slide>
              ))}

              <Box display="flex" flexDirection="column" alignItems="center" mt={3} gap={2}>
                {loading && (
                  <Box sx={{ width: '100%', maxWidth: 400 }}>
                    <Typography variant="body2" sx={{ textAlign: 'center', mb: 1, color: '#64748b' }}>
                      {importStatus}
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={importProgress} 
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 4,
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        },
                      }}
                    />
                    <Typography variant="caption" sx={{ textAlign: 'center', mt: 1, color: '#64748b' }}>
                      {Math.round(importProgress)}% complete
                    </Typography>
                  </Box>
                )}
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<PlayArrow />}
                  onClick={handleImport}
                  disabled={loading}
                  sx={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)',
                    py: 2,
                    px: 4,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                      boxShadow: '0 12px 35px rgba(16, 185, 129, 0.4)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Start Import'}
                </Button>
              </Box>
            </Box>
          )}

          {activeStep === 2 && (
            <Card
              sx={{
                backdropFilter: 'blur(16px)',
                background: 'rgba(255, 255, 255, 0.85)',
                borderRadius: 4,
                boxShadow: '0 12px 24px rgba(0, 0, 0, 0.08)',
                border: '1px solid rgba(255,255,255,0.2)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.12)',
                },
              }}
            >
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 24px',
                    boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)',
                  }}
                >
                  <CheckCircle sx={{ fontSize: 60, color: 'white' }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                  Import Complete!
                </Typography>
                <Typography variant="body1" sx={{ color: '#64748b', mb: 4 }}>
                  Your data has been successfully imported into the CRM system.
                </Typography>
                
                {importResults && (
                  <Box sx={{ mb: 3 }}>
                                         <Chip
                       label={`${importResults.total_imported} contacts imported`}
                       color="success"
                       sx={{ fontWeight: 600, fontSize: '1rem', py: 1, px: 2 }}
                     />
                  </Box>
                )}

                <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap">
                  <Button
                    variant="contained"
                    onClick={() => navigate('/contacts')}
                    sx={{
                      background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                      boxShadow: '0 8px 25px rgba(99, 102, 241, 0.3)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
                        boxShadow: '0 12px 35px rgba(99, 102, 241, 0.4)',
                        transform: 'translateY(-2px)',
                      },
                    }}
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
                    }}
                    sx={{
                      borderWidth: '2px',
                      '&:hover': {
                        borderWidth: '2px',
                        background: 'rgba(99, 102, 241, 0.04)',
                      },
                    }}
                  >
                    Import More Data
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}
        </Box>
      </Grow>
    </Box>
  );
};

export default ImportDataPage;