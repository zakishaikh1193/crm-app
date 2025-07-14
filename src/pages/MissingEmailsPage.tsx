import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Button, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Pagination } from '@mui/material';
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
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    total_pages: 0,
    current_page: 1,
    per_page: 20
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async (pageNum = 1) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/contacts/missing-emails?page=${pageNum}&limit=20`);
      setContacts(res.data.contacts || []);
      setPagination(res.data.pagination || {
        total: 0,
        total_pages: 0,
        current_page: pageNum,
        per_page: 20
      });
      setPage(pageNum);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch contacts');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, pageNum: number) => {
    fetchContacts(pageNum);
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
            {pagination.total > 0 && ` (${pagination.total} total contacts)`}
          </Typography>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : (
            <>
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
              {/* Pagination */}
              {pagination.total_pages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                  <Pagination
                    count={pagination.total_pages}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                    showFirstButton
                    showLastButton
                  />
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default MissingEmailsPage; 