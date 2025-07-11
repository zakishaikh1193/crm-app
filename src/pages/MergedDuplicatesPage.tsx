import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Button, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../config/axiosConfig';

interface MergedContact {
  id: number;
  first_name?: string;
  last_name?: string;
  company_id?: number;
  company_name?: string;
  duplicate_of?: number;
  updated_at?: string;
}

const MergedDuplicatesPage: React.FC = () => {
  const [contacts, setContacts] = useState<MergedContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/contacts/merged-duplicates');
      setContacts(res.data.contacts || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch merged contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this merged contact?')) return;
    setDeletingId(id);
    setSuccess('');
    setError('');
    try {
      await api.delete(`/contacts/${id}`);
      setContacts((prev) => prev.filter((c) => c.id !== id));
      setSuccess('Contact deleted successfully.');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete contact');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Box maxWidth={900} mx="auto" mt={6}>
      <Card sx={{ boxShadow: 4, borderRadius: 4 }}>
        <CardContent>
          <Typography variant="h5" fontWeight={700} color="primary.main" gutterBottom>
            Merged Duplicate Contacts
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            These contacts have been merged and are marked as duplicates. You can delete them individually.
          </Typography>
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : (
            <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Name</strong></TableCell>
                    <TableCell><strong>Company</strong></TableCell>
                    <TableCell><strong>Merged Into (ID)</strong></TableCell>
                    <TableCell><strong>Last Updated</strong></TableCell>
                    <TableCell align="center"><strong>Action</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {contacts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">No merged duplicates found.</TableCell>
                    </TableRow>
                  ) : contacts.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>{[c.first_name, c.last_name].filter(Boolean).join(' ') || 'Unnamed'}</TableCell>
                      <TableCell>{c.company_name || '-'}</TableCell>
                      <TableCell>{c.duplicate_of || '-'}</TableCell>
                      <TableCell>{c.updated_at ? new Date(c.updated_at).toLocaleString() : '-'}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          color="error"
                          onClick={() => handleDelete(c.id)}
                          disabled={deletingId === c.id}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default MergedDuplicatesPage; 