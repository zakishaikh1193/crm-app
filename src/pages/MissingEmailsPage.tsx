import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Button, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../config/axiosConfig';
import EmailIcon from '@mui/icons-material/Email';

interface Contact {
  id: number;
  first_name?: string;
  last_name?: string;
  company_id?: number;
  company_name?: string;
}

const MissingEmailsPage: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/contacts/missing-emails');
      setContacts(res.data.contacts || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch contacts');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxWidth={900} mx="auto" mt={6}>
      <Card sx={{ boxShadow: 4, borderRadius: 4 }}>
        <CardContent>
          <Typography variant="h5" fontWeight={700} color="primary.main" gutterBottom>
            Contacts Missing Emails
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            These contacts do not have an email address. Use the Predict Email tool to generate and save one.
          </Typography>
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
                    <TableCell align="center"><strong>Action</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {contacts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center">All contacts have emails!</TableCell>
                    </TableRow>
                  ) : contacts.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>{[c.first_name, c.last_name].filter(Boolean).join(' ') || 'Unnamed'}</TableCell>
                      <TableCell>{c.company_name || '-'}</TableCell>
                      <TableCell align="center">
                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={<EmailIcon />}
                          onClick={() => navigate(`/email-finder/${c.id}`)}
                          sx={{ borderRadius: 3 }}
                        >
                          Predict Email
                        </Button>
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

export default MissingEmailsPage; 