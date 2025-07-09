import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
  CircularProgress,
  Alert,
  Fade,
  Slide,
  Grow,
  Avatar,
  Tooltip,
  useTheme,
  useMediaQuery,
  Divider,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Search,
  Upload,
  FilterList,
  Person,
  Email,
  Phone,
  Business,
  CalendarToday,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../config/axiosConfig';

interface Email {
  id: number;
  contact_id: number;
  email: string;
  type: string;
  is_primary?: boolean;
}

interface Phone {
  id: number;
  contact_id: number;
  phone: string;
  type: string;
}

interface Company {
  id: number;
  name: string;
  industry?: string;
  city?: string;
}

interface Contact {
  id: number;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  emails: Email[];
  phones: Phone[];
  company?: Company;
  department?: string;
  tags?: string;
  lead_status?: string;
  created_at: string;
}

const ContactListPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalContacts, setTotalContacts] = useState(0);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchContacts();
  }, [currentPage, searchTerm, statusFilter]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      if (statusFilter) {
        params.append('status', statusFilter);
      }

      const response = await api.get(`/contacts?${params.toString()}`);
      setContacts(response.data.contacts);
      setTotalPages(response.data.pagination.total_pages);
      setTotalContacts(response.data.pagination.total);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await api.delete(`/contacts/${id}`);
        fetchContacts();
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to delete contact');
      }
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (e: any) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'default';
      case 'contacted':
        return 'info';
      case 'qualified':
        return 'success';
      case 'unqualified':
        return 'error';
      case 'customer':
        return 'success';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return (first + last).toUpperCase();
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
      {/* Header */}
      <Fade in={true} timeout={800}>
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: { xs: 'flex-start', md: 'center' },
            flexDirection: { xs: 'column', md: 'row' },
            mb: 4,
            gap: 2,
          }}
        >
          <Box>
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
              Contacts
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#64748b',
                fontWeight: 500,
              }}
            >
              Manage your customer contacts ({totalContacts} total)
            </Typography>
          </Box>
          <Box display="flex" gap={2} flexWrap="wrap">
            <Button
              variant="outlined"
              startIcon={<Upload />}
              onClick={() => navigate('/import')}
              sx={{
                borderWidth: '2px',
                '&:hover': {
                  borderWidth: '2px',
                  background: 'rgba(99, 102, 241, 0.04)',
                },
              }}
            >
              Import Contacts
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/contacts/new')}
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
              Add Contact
            </Button>
          </Box>
        </Box>
      </Fade>

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

      {/* Search and Filter */}
      <Grow in={true} timeout={1000}>
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
          <Box sx={{ p: 3 }}>
            <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
              <TextField
                placeholder="Search contacts..."
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: '#64748b' }} />,
                }}
                sx={{
                  minWidth: 250,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#6366f1',
                      },
                    },
                    '&.Mui-focused': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#6366f1',
                        borderWidth: '2px',
                      },
                    },
                  },
                }}
              />
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  label="Status"
                  startAdornment={<FilterList sx={{ mr: 1, color: '#64748b' }} />}
                  sx={{
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#e2e8f0',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#6366f1',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#6366f1',
                      borderWidth: '2px',
                    },
                  }}
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="new">New</MenuItem>
                  <MenuItem value="contacted">Contacted</MenuItem>
                  <MenuItem value="qualified">Qualified</MenuItem>
                  <MenuItem value="unqualified">Unqualified</MenuItem>
                  <MenuItem value="customer">Customer</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        </Card>
      </Grow>

      {/* Contacts Table */}
      <Grow in={true} timeout={1200}>
        <Card
          sx={{
            backdropFilter: 'blur(16px)',
            background: 'rgba(255, 255, 255, 0.85)',
            borderRadius: 4,
            boxShadow: '0 12px 24px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(255,255,255,0.2)',
            overflow: 'hidden',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.12)',
            },
          }}
        >
          {loading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <CircularProgress 
                sx={{ 
                  color: '#6366f1',
                  mb: 2,
                }} 
              />
              <Typography variant="h6" sx={{ color: '#64748b' }}>
                Loading contacts...
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ background: 'rgba(99, 102, 241, 0.04)' }}>
                    <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Contact</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Company</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Created</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {contacts.map((contact, index) => (
                    <Slide direction="up" in={true} timeout={300 + index * 100} key={contact.id}>
                      <TableRow
                        sx={{
                          '&:hover': {
                            background: 'rgba(99, 102, 241, 0.02)',
                          },
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Avatar
                              sx={{
                                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                                width: 40,
                                height: 40,
                                fontSize: '0.875rem',
                                fontWeight: 600,
                              }}
                            >
                              {getInitials(contact.first_name, contact.last_name)}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1e293b' }}>
                                {contact.full_name || `${contact.first_name} ${contact.last_name}`}
                              </Typography>
                              {contact.emails.length > 0 && (
                                <Typography variant="body2" sx={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <Email sx={{ fontSize: 14 }} />
                                  {contact.emails.find(e => e.is_primary)?.email || contact.emails[0]?.email}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {contact.company ? (
                            <Box display="flex" alignItems="center" gap={1}>
                              <Business sx={{ fontSize: 16, color: '#64748b' }} />
                              <Typography variant="body2" sx={{ color: '#475569' }}>
                                {contact.company.name}
                              </Typography>
                            </Box>
                          ) : (
                            <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                              No company
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={contact.lead_status || 'new'}
                            color={getStatusColor(contact.lead_status || 'new')}
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <CalendarToday sx={{ fontSize: 14, color: '#64748b' }} />
                            <Typography variant="body2" sx={{ color: '#64748b' }}>
                              {formatDate(contact.created_at)}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" gap={1}>
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() => navigate(`/contacts/${contact.id}`)}
                                sx={{
                                  color: '#6366f1',
                                  '&:hover': {
                                    background: 'rgba(99, 102, 241, 0.1)',
                                  },
                                }}
                              >
                                <Visibility />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit Contact">
                              <IconButton
                                size="small"
                                onClick={() => navigate(`/contacts/${contact.id}/edit`)}
                                sx={{
                                  color: '#f59e0b',
                                  '&:hover': {
                                    background: 'rgba(245, 158, 11, 0.1)',
                                  },
                                }}
                              >
                                <Edit />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Contact">
                              <IconButton
                                size="small"
                                onClick={() => handleDelete(contact.id)}
                                sx={{
                                  color: '#ef4444',
                                  '&:hover': {
                                    background: 'rgba(239, 68, 68, 0.1)',
                                  },
                                }}
                              >
                                <Delete />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    </Slide>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Card>
      </Grow>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <Grow in={true} timeout={1400}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={(_, page) => setCurrentPage(page)}
              color="primary"
              sx={{
                '& .MuiPaginationItem-root': {
                  borderRadius: 2,
                  fontWeight: 600,
                },
                '& .Mui-selected': {
                  background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                },
              }}
            />
          </Box>
        </Grow>
      )}
    </Box>
  );
};

export default ContactListPage;