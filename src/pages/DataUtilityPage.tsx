import React, { useState } from 'react';
import { Box, Button, Typography, Alert, CircularProgress, Card, CardContent, Grid, Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate } from 'react-router-dom';
import api from '../config/axiosConfig';

const DataUtilityPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [duplicates, setDuplicates] = useState<any[]>([]);
  const [duplicateGroups, setDuplicateGroups] = useState<any[]>([]);
  const [loadingDuplicates, setLoadingDuplicates] = useState(false);
  const navigate = useNavigate();

  const handleCleanData = async () => {
    setLoading(true);
    setSuccess('');
    setError('');
    try {
      await api.post('/contacts/mark-duplicates');
      setSuccess('Duplicates marked successfully!');
      // Optionally, fetch duplicates to display
      const res = await api.get('/contacts?duplicates=1');
      setDuplicates(res.data.contacts || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to mark duplicates');
    } finally {
      setLoading(false);
    }
  };

  const handleFetchDuplicates = async () => {
    setLoadingDuplicates(true);
    setError('');
    try {
      const res = await api.get('/contacts/duplicates');
      setDuplicateGroups(res.data.duplicate_groups || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch duplicate groups');
    } finally {
      setLoadingDuplicates(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
        Data Utility
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Use this tool to clean your data by marking and merging duplicate contacts.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={handleCleanData}
        disabled={loading}
        sx={{ mb: 3, mr: 2 }}
      >
        {loading ? <CircularProgress size={24} /> : 'Clean Data (Mark Duplicates)'}
      </Button>
      <Button
        variant="outlined"
        color="secondary"
        onClick={handleFetchDuplicates}
        disabled={loadingDuplicates}
        sx={{ mb: 3 }}
      >
        {loadingDuplicates ? <CircularProgress size={24} /> : 'Review Duplicates'}
      </Button>
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {/* Duplicates Review UI */}
      {duplicateGroups.length > 0 && (
        <Box>
          <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>Duplicate Groups</Typography>
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
                            <TableCell key={c.id}>{[c.first_name, c.last_name].filter(Boolean).join(' ')}</TableCell>
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
                            <TableCell key={c.id}>{c.company_name || '-'}</TableCell>
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
        </Box>
      )}
    </Box>
  );
};

export default DataUtilityPage; 