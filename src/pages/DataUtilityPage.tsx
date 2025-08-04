import React, { useState, useEffect } from 'react';
import { 
  Box, Button, Typography, Alert, CircularProgress, Card, CardContent, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, IconButton, Pagination, Stepper, Step, StepLabel, StepContent, 
  Accordion, AccordionSummary, AccordionDetails, Tooltip, Divider, Grid,
  LinearProgress, Chip
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EmailIcon from '@mui/icons-material/Email';
import DeleteIcon from '@mui/icons-material/Delete';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useNavigate } from 'react-router-dom';
import api from '../config/axiosConfig';

// Define the steps for the stepper
const steps = [
  'Find Duplicates',
  'Review & Merge',
  'Complete'
];

const DataUtilityPage: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [completed, setCompleted] = useState<{ [k: number]: boolean }>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [duplicates, setDuplicates] = useState<any[]>([]);
  const [duplicateGroups, setDuplicateGroups] = useState<any[]>([]);
  const [loadingDuplicates, setLoadingDuplicates] = useState(false);
  const [duplicatePage, setDuplicatePage] = useState(1);
  const [duplicatePagination, setDuplicatePagination] = useState({
    total: 0,
    total_pages: 0,
    current_page: 1,
    per_page: 20
  });
  const [expanded, setExpanded] = useState<string | false>('panel1');
  const [scanStatus, setScanStatus] = useState<any>(null);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const navigate = useNavigate();

  // Check scan status on component mount
  useEffect(() => {
    checkScanStatus();
  }, []);

  const checkScanStatus = async () => {
    setCheckingStatus(true);
    try {
      const response = await api.get('/contacts/duplicates/scan-status');
      setScanStatus(response.data);
      
      // If duplicates are already scanned, mark step 0 as completed
      if (response.data.has_scanned) {
        setCompleted(prev => ({ ...prev, 0: true }));
        setActiveStep(1);
      }
    } catch (err: any) {
      console.error('Failed to check scan status:', err);
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  const handleCleanData = async (forceRescan = false) => {
    setLoading(true);
    setSuccess('');
    setError('');
    try {
      const url = forceRescan ? '/contacts/mark-duplicates?clear=true' : '/contacts/mark-duplicates';
      await api.post(url);
      setSuccess('Duplicates found and marked successfully! Click "Review Duplicates" to view and merge them.');
      // Optionally, fetch duplicates to display
      const res = await api.get('/contacts?duplicates=1');
      setDuplicates(res.data.contacts || []);
      setCompleted({...completed, 0: true});
      setActiveStep(1);
      // Update scan status
      await checkScanStatus();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to find duplicates');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickReview = async () => {
    if (scanStatus?.has_scanned) {
      await handleFetchDuplicates(1);
    }
  };

  const handleClearDuplicates = async () => {
    if (!window.confirm('Are you sure you want to clear all duplicate markings? This will reset all duplicate groups.')) {
      return;
    }
    setLoading(true);
    setSuccess('');
    setError('');
    try {
      await api.post('/contacts/clear-duplicates');
      setSuccess('All duplicate markings cleared successfully!');
      setDuplicateGroups([]);
      setDuplicatePagination({
        total: 0,
        total_pages: 0,
        current_page: 1,
        per_page: 20
      });
      setCompleted({});
      setActiveStep(0);
      await checkScanStatus();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to clear duplicates');
    } finally {
      setLoading(false);
    }
  };

  const handleFetchDuplicates = async (page = 1) => {
    setLoadingDuplicates(true);
    setError('');
    try {
      const res = await api.get(`/contacts/duplicates?page=${page}&limit=10`);
      setDuplicateGroups(res.data.duplicate_groups || []);
      setDuplicatePagination(res.data.pagination || {
        total: 0,
        total_pages: 0,
        current_page: page,
        per_page: 10
      });
      setDuplicatePage(page);
      setActiveStep(1);
      setCompleted({...completed, 1: true});
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch duplicate groups');
    } finally {
      setLoadingDuplicates(false);
    }
  };

  const handleDuplicatePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    handleFetchDuplicates(page);
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Data Cleaning Assistant
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Follow these steps to identify and merge duplicate contacts in your database.
        </Typography>
        
        {/* Stepper */}
        <Box sx={{ mb: 4, maxWidth: 800, mx: 'auto' }}>
          <Stepper activeStep={activeStep} orientation="horizontal" alternativeLabel>
            {steps.map((label, index) => (
              <Step key={label} completed={completed[index]}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {/* Main Actions Card */}
        <Card sx={{ mb: 3, boxShadow: 3 }}>
          <CardContent>
            <Grid container spacing={3}>
              {/* Step 1: Find Duplicates */}
              <Grid item xs={12} md={4}>
                <Box sx={{ p: 2, borderRight: { md: '1px solid #e0e0e0' }, height: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>1. Find Duplicates</Typography>
                    <Tooltip title="Scans your contacts for potential duplicates" arrow>
                      <HelpOutlineIcon fontSize="small" sx={{ ml: 1, color: 'text.secondary' }} />
                    </Tooltip>
                  </Box>
                  
                  {checkingStatus ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={20} />
                      <Typography variant="body2">Checking status...</Typography>
                    </Box>
                  ) : scanStatus?.has_scanned ? (
                    <Box>
                      <Chip 
                        label={`${scanStatus.total_groups} groups found`}
                        color="success"
                        sx={{ mb: 1 }}
                      />
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleCleanData(true)}
                        disabled={loading}
                        fullWidth
                        sx={{ mb: 1 }}
                        startIcon={<RefreshIcon />}
                      >
                        {loading ? <CircularProgress size={24} /> : 'Re-scan Duplicates'}
                      </Button>
                      <Typography variant="caption" color="success.main" sx={{ display: 'flex', alignItems: 'center' }}>
                        <CheckCircleIcon fontSize="small" sx={{ mr: 0.5 }} />
                        Previous scan found {scanStatus.total_duplicates} duplicates
                      </Typography>
                    </Box>
                  ) : (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleCleanData(false)}
                      disabled={loading}
                      fullWidth
                      sx={{ mb: 1 }}
                    >
                      {loading ? <CircularProgress size={24} /> : 'Scan for Duplicates'}
                    </Button>
                  )}
                </Box>
              </Grid>
              
              {/* Step 2: Review & Merge */}
              <Grid item xs={12} md={4}>
                <Box sx={{ p: 2, borderRight: { md: '1px solid #e0e0e0' }, height: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>2. Review & Merge</Typography>
                    <Tooltip title="Review potential duplicates and merge them" arrow>
                      <HelpOutlineIcon fontSize="small" sx={{ ml: 1, color: 'text.secondary' }} />
                    </Tooltip>
                  </Box>
                  
                  {scanStatus?.has_scanned ? (
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={handleQuickReview}
                      disabled={loadingDuplicates}
                      fullWidth
                      sx={{ mb: 1 }}
                      startIcon={completed[1] ? <CheckCircleIcon /> : null}
                    >
                      {loadingDuplicates ? <CircularProgress size={24} /> : 
                       completed[1] ? 'Review in Progress' : 'Quick Review Duplicates'}
                    </Button>
                  ) : (
                    <Button
                      variant="outlined"
                      color="secondary"
                      disabled={true}
                      fullWidth
                      sx={{ mb: 1 }}
                    >
                      Scan First
                    </Button>
                  )}
                  
                  {scanStatus?.has_scanned && (
                    <Typography variant="caption" color="text.secondary">
                      {scanStatus.total_groups} duplicate groups available for review
                    </Typography>
                  )}
                </Box>
              </Grid>
              
              {/* Additional Tools */}
              <Grid item xs={12} md={4}>
                <Box sx={{ p: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Additional Tools</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Button
                      variant="outlined"
                      color="info"
                      startIcon={<EmailIcon />}
                      onClick={() => navigate('/missing-emails')}
                      fullWidth
                      sx={{ justifyContent: 'flex-start' }}
                    >
                      Find Missing Emails
                    </Button>
                    <Button
                      variant="outlined"
                      color="warning"
                      startIcon={<VisibilityIcon />}
                      onClick={() => navigate('/merged-duplicates')}
                      fullWidth
                      sx={{ justifyContent: 'flex-start' }}
                    >
                      View Merged Records
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={handleClearDuplicates}
                      disabled={loading}
                      fullWidth
                      sx={{ justifyContent: 'flex-start' }}
                    >
                      Reset All Markings
                    </Button>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
      
      {/* Status Messages */}
      <Box sx={{ mb: 3 }}>
        {success && (
          <Alert 
            severity="success" 
            sx={{ mb: 2 }}
            onClose={() => setSuccess('')}
          >
            {success}
          </Alert>
        )}
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 2 }}
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}
      </Box>

      {/* Help Section */}
      <Accordion 
        expanded={expanded === 'panel1'} 
        onChange={handleAccordionChange('panel1')}
        sx={{ mb: 3, boxShadow: 2 }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography sx={{ fontWeight: 600 }}>How to use the Data Cleaning Assistant</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Step 1: Find Duplicates</Typography>
            <Typography variant="body2" paragraph>
              Click "Scan for Duplicates" to search your contacts for potential duplicates. This process may take a few moments depending on the size of your database. 
              <strong>Once scanned, results are cached so you don't need to re-scan every time.</strong>
            </Typography>
            
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Step 2: Review & Merge</Typography>
            <Typography variant="body2" paragraph>
              After scanning, click "Quick Review Duplicates" to see potential matches. Review each group and use the "Merge Group" button to combine duplicate records.
              <strong>You can review duplicates immediately without re-scanning.</strong>
            </Typography>
            
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Additional Tools</Typography>
            <Typography variant="body2" paragraph>
              - <strong>Find Missing Emails:</strong> Identify contacts without email addresses
              - <strong>View Merged Records:</strong> See previously merged contacts
              - <strong>Reset All Markings:</strong> Clear all duplicate markings and start over
            </Typography>
            
            <Typography variant="caption" color="text.secondary">
              Note: No changes are made to your data until you explicitly merge records. Scan results are cached for faster subsequent access.
            </Typography>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Duplicates Review UI */}
      {duplicateGroups.length > 0 && (
        <Box>
          <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
            Duplicate Groups ({duplicatePagination.total} total)
          </Typography>
          {duplicateGroups.map((group, idx) => {
            const allContacts = [group.master, ...group.duplicates];
            return (
              <Card variant="outlined" sx={{ mb: 4 }} key={group.master?.id || idx}>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Group #{idx + 1}</Typography>
                  <TableContainer component={Paper} sx={{ mb: 2 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700 }}>Field</TableCell>
                          {allContacts.map((contact: any, i: number) => (
                            <TableCell key={contact.id} sx={{ fontWeight: 700 }}>
                              {i === 0 ? 'Master' : `Duplicate ${i}`}
                              <IconButton size="small" onClick={() => navigate(`/contacts/${contact.id}`)}>
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          {allContacts.map((c: any) => (
                            <TableCell key={c.id}>
                              {[c.first_name, c.last_name].filter(Boolean).join(' ') || 'Unnamed'}
                            </TableCell>
                          ))}
                        </TableRow>
                        <TableRow>
                          <TableCell>Title</TableCell>
                          {allContacts.map((c: any) => (
                            <TableCell key={c.id}>{c.title || '-'}</TableCell>
                          ))}
                        </TableRow>
                        <TableRow>
                          <TableCell>Company</TableCell>
                          {allContacts.map((c: any) => (
                            <TableCell key={c.id}>
                              {c.company?.name || '-'}
                            </TableCell>
                          ))}
                        </TableRow>
                        <TableRow>
                          <TableCell>Department</TableCell>
                          {allContacts.map((c: any) => (
                            <TableCell key={c.id}>
                              {c.department?.name || '-'}
                            </TableCell>
                          ))}
                        </TableRow>
                        <TableRow>
                          <TableCell>Emails</TableCell>
                          {allContacts.map((c: any) => (
                            <TableCell key={c.id}>
                              {Array.isArray(c.emails) && c.emails.length > 0
                                ? c.emails.map((e: any) => (
                                    <div key={e.id}>{e.email} <span style={{ color: '#64748b', fontSize: 12 }}>({e.type})</span></div>
                                  ))
                                : '-'}
                            </TableCell>
                          ))}
                        </TableRow>
                        <TableRow>
                          <TableCell>Phones</TableCell>
                          {allContacts.map((c: any) => (
                            <TableCell key={c.id}>
                              {Array.isArray(c.phones) && c.phones.length > 0
                                ? c.phones.map((p: any) => (
                                    <div key={p.id}>{p.phone} <span style={{ color: '#64748b', fontSize: 12 }}>({p.type})</span></div>
                                  ))
                                : '-'}
                            </TableCell>
                          ))}
                        </TableRow>
                        <TableRow>
                          <TableCell>Created At</TableCell>
                          {allContacts.map((c: any) => (
                            <TableCell key={c.id}>{c.created_at ? new Date(c.created_at).toLocaleString() : '-'}</TableCell>
                          ))}
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                  {/* Merge button: navigate to merge page with group data */}
                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    sx={{ mt: 1 }}
                    onClick={() => navigate('/contacts/merge', { state: { duplicateGroup: group } })}
                  >
                    Merge Group
                  </Button>
                </CardContent>
              </Card>
            );
          })}
          {/* Pagination */}
          {duplicatePagination.total_pages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={duplicatePagination.total_pages}
                page={duplicatePage}
                onChange={handleDuplicatePageChange}
                color="primary"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default DataUtilityPage; 