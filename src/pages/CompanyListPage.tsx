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
  IconButton,
  CircularProgress,
  Alert,
  Fade,
  Slide,
  Grow,
  Avatar,
  Tooltip,
  useTheme,
  useMediaQuery,
  Chip,
  Pagination,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Search,
  Business,
  Language,
  Email,
  Phone,
  CalendarToday,
  Domain,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../config/axiosConfig';

interface Company {
  id: number;
  name: string;
  industry?: string;
  website?: string;
  email?: string;
  phone?: string;
  created_at: string;
}

const CompanyListPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCompanies, setTotalCompanies] = useState(0);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchCompanies();
  }, [currentPage, searchTerm]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      const response = await api.get(`/companies?${params.toString()}`);
      setCompanies(response.data.companies);
      setTotalPages(response.data.pagination.total_pages);
      setTotalCompanies(response.data.pagination.total);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch companies');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this company?')) {
      try {
        await api.delete(`/companies/${id}`);
        fetchCompanies();
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to delete company');
      }
    }
  };

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (company.industry && company.industry.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);
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
              Companies
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#64748b',
                fontWeight: 500,
              }}
            >
              Manage your business companies ({totalCompanies} total)
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/companies/new')}
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
            Add Company
          </Button>
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

      {/* Search */}
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
            <TextField
              placeholder="Search companies..."
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
          </Box>
        </Card>
      </Grow>

      {/* Companies Table */}
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
                Loading companies...
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ background: 'rgba(99, 102, 241, 0.04)' }}>
                    <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Company</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Industry</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Contact Info</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Created</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredCompanies.map((company, index) => (
                    <Slide direction="up" in={true} timeout={300 + index * 100} key={company.id}>
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
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                width: 40,
                                height: 40,
                                fontSize: '0.875rem',
                                fontWeight: 600,
                              }}
                            >
                              {getInitials(company.name)}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1e293b' }}>
                                {company.name}
                              </Typography>
                              {company.website && (
                                <Typography variant="body2" sx={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <Language sx={{ fontSize: 14 }} />
                                  <a 
                                    href={company.website} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    style={{ 
                                      color: '#6366f1', 
                                      textDecoration: 'none',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                                    onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                                  >
                                    {company.website}
                                  </a>
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {company.industry ? (
                            <Chip
                              label={company.industry}
                              size="small"
                              color="primary"
                              sx={{ fontWeight: 600 }}
                            />
                          ) : (
                            <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                              No industry
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Box display="flex" flexDirection="column" gap={0.5}>
                            {company.email && (
                              <Box display="flex" alignItems="center" gap={1}>
                                <Email sx={{ fontSize: 14, color: '#64748b' }} />
                                <Typography variant="body2" sx={{ color: '#475569' }}>
                                  {company.email}
                                </Typography>
                              </Box>
                            )}
                            {company.phone && (
                              <Box display="flex" alignItems="center" gap={1}>
                                <Phone sx={{ fontSize: 14, color: '#64748b' }} />
                                <Typography variant="body2" sx={{ color: '#475569' }}>
                                  {company.phone}
                                </Typography>
                              </Box>
                            )}
                            {!company.email && !company.phone && (
                              <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                                No contact info
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <CalendarToday sx={{ fontSize: 14, color: '#64748b' }} />
                            <Typography variant="body2" sx={{ color: '#64748b' }}>
                              {formatDate(company.created_at)}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" gap={1}>
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() => navigate(`/companies/${company.id}`)}
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
                            <Tooltip title="Edit Company">
                              <IconButton
                                size="small"
                                onClick={() => navigate(`/companies/${company.id}/edit`)}
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
                            <Tooltip title="Delete Company">
                              <IconButton
                                size="small"
                                onClick={() => handleDelete(company.id)}
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
      {/* Pagination Controls */}
      <Box display="flex" justifyContent="center" mt={3}>
        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={(_, value) => setCurrentPage(value)}
          color="primary"
          shape="rounded"
          size="large"
        />
      </Box>
    </Box>
  );
};

export default CompanyListPage;