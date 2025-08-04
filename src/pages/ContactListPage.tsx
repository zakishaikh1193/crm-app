import React, { useState, useEffect, useCallback } from 'react';
import * as XLSX from 'xlsx';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  Checkbox,
  FormControlLabel,
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
  Update,
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

interface FilterOptions {
  companies: { id: number; name: string }[];
  industries: string[];
  departments: { id: number; name: string }[];
}

interface Filters {
  company: number[];
  industry: string[];
  department: number[];
}

const initialFilters: Filters = {
  company: [],
  industry: [],
  department: [],
};

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
  status?: string;
  lead_status?: string;
  created_at: string;
}

const ContactListPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [displaySearchTerm, setDisplaySearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalContacts, setTotalContacts] = useState(0);
  const [statuses, setStatuses] = useState<Array<{value: string, label: string, color: string}>>([]);
  const [loadingStatuses, setLoadingStatuses] = useState(false);
  const [csvUploadOpen, setCsvUploadOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvUploading, setCsvUploading] = useState(false);
  const [csvResults, setCsvResults] = useState<any>(null);
  const [searchTimeout, setSearchTimeout] = useState<number | null>(null);
  
  // Filter states
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    companies: [],
    industries: [],
    departments: [],
  });
  const [filters, setFilters] = useState<Filters>({ ...initialFilters });

  const itemsPerPage = 10;

  // Debounced search function
  const debouncedSearch = useCallback((term: string) => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    const timeout = setTimeout(() => {
      setSearching(true);
      setSearchTerm(term);
      setCurrentPage(1); // Reset to first page when searching
    }, 500);
    
    setSearchTimeout(timeout);
  }, [searchTimeout]);

  useEffect(() => {
    fetchFilterOptions();
    fetchContacts();
    fetchStatuses();
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [currentPage, searchTerm, statusFilter, filters]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  // Reset page to 1 when filters change
  useEffect(() => { setCurrentPage(1); }, [filters]);

  // Helper to build chips for active filters
  const getActiveFilterChips = () => {
    const chips: { label: string; value: string; key: keyof Filters }[] = [];
    if (filters.company.length) chips.push({ label: 'Company', value: filterOptions.companies.filter(c => filters.company.includes(c.id)).map(c => c.name).join(', '), key: 'company' });
    if (filters.industry.length) chips.push({ label: 'Industry', value: filters.industry.join(', '), key: 'industry' });
    if (filters.department.length) chips.push({ label: 'Department', value: filterOptions.departments.filter(d => filters.department.includes(d.id)).map(d => d.name).join(', '), key: 'department' });
    return chips;
  };

  const handleChipDelete = (key: keyof Filters) => {
    setFilters(prev => ({ ...prev, [key]: Array.isArray(prev[key]) ? [] : (typeof prev[key] === 'boolean' ? null : '') }));
  };

  const handleFilterChange = (key: keyof Filters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const fetchContacts = async () => {
    try {
      if (searchTerm) {
        setSearching(true);
      } else {
        setLoading(true);
      }
      
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

      // Add filters to params (use pipe | as delimiter for multi-select)
      if (filters.company.length) params.append('company', filters.company.join('|'));
      if (filters.industry.length) params.append('industry', filters.industry.join('|'));
      if (filters.department.length) params.append('department', filters.department.join('|'));

      const response = await api.get(`/contacts?${params.toString()}`);
      setContacts(response.data.contacts);
      setTotalPages(response.data.pagination.total_pages);
      setTotalContacts(response.data.pagination.total);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch contacts');
    } finally {
      setLoading(false);
      setSearching(false);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const res = await api.get('/contacts/filter-options');
      setFilterOptions(res.data);
    } catch (err) {
      // Optionally handle error
    }
  };

  const fetchStatuses = async () => {
    try {
      setLoadingStatuses(true);
      const response = await api.get('/contacts/statuses');
      setStatuses(response.data.statuses);
    } catch (err: any) {
      console.error('Failed to fetch statuses:', err);
    } finally {
      setLoadingStatuses(false);
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
    const value = e.target.value;
    // Update the display value immediately for better UX
    setDisplaySearchTerm(value);
    // Use debounced search to avoid API calls on every keystroke
    debouncedSearch(value);
  };

  const handleStatusFilterChange = (e: any) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusChange = async (contactId: number, newStatus: string) => {
    try {
      await api.put(`/contacts/${contactId}/status`, { status: newStatus });
      // Update the contact in the local state
      setContacts(prevContacts => 
        prevContacts.map(contact => 
          contact.id === contactId 
            ? { ...contact, status: newStatus }
            : contact
        )
      );
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update status');
    }
  };

  const handleCsvFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log('File selected:', file);
    console.log('File type:', file?.type);
    console.log('File name:', file?.name);
    
    if (file && (
      file.type === 'text/csv' || 
      file.name.endsWith('.csv') ||
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.name.endsWith('.xlsx') ||
      file.type === 'application/vnd.ms-excel' ||
      file.name.endsWith('.xls')
    )) {
      setCsvFile(file);
      setError('');
      console.log('File accepted (CSV or Excel)');
    } else {
      setError('Please select a valid CSV or Excel file (.csv, .xlsx, .xls)');
      console.error('Invalid file type:', file?.type, 'or name:', file?.name);
    }
  };

  const parseCSV = (csvText: string) => {
    console.log('Parsing CSV text...');
    const lines = csvText.split('\n');
    console.log('Number of lines:', lines.length);
    console.log('First line:', lines[0]);
    
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    console.log('Headers:', headers);
    
    // Check if required columns exist
    if (!headers.includes('email') || !headers.includes('status')) {
      console.error('Missing required columns. Found headers:', headers);
      throw new Error('CSV must contain "email" and "status" columns');
    }

    const data = [];
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(',').map(v => v.trim());
        console.log(`Row ${i}:`, values);
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        data.push(row);
      }
    }
    console.log('Parsed data:', data);
    return data;
  };

  const processFileData = async (fileData: any[]) => {
    try {
      console.log('Making API call...');
      const response = await api.post('/contacts/bulk-update-statuses-csv', {
        csvData: fileData
      });
      console.log('API response:', response.data);

      setCsvResults(response.data.results);
      setCsvUploadOpen(false);
      setCsvFile(null);
      
      // Refresh contacts list
      fetchContacts();
    } catch (err: any) {
      console.error('Error in API call:', err);
      console.error('Error details:', err.response?.data);
      setError(err.response?.data?.error || 'Failed to process file');
    } finally {
      setCsvUploading(false);
    }
  };

  const handleCsvUpload = async () => {
    if (!csvFile) return;

    try {
      setCsvUploading(true);
      setError('');
      console.log('Starting file upload process...');

      let fileData: any[] = [];
      
      if (csvFile.name.endsWith('.csv')) {
        // Handle CSV files
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            console.log('CSV file read successfully');
            const csvText = e.target?.result as string;
            console.log('CSV text length:', csvText.length);
            console.log('CSV text preview:', csvText.substring(0, 200));
            
            fileData = parseCSV(csvText);
            console.log('Parsed CSV data:', fileData);
            console.log('Number of rows:', fileData.length);

            await processFileData(fileData);
          } catch (err: any) {
            console.error('Error in CSV processing:', err);
            setError(err.message || 'Failed to process CSV file');
            setCsvUploading(false);
          }
        };

        reader.onerror = (error) => {
          console.error('FileReader error:', error);
          setError('Failed to read CSV file');
          setCsvUploading(false);
        };

        console.log('Starting to read CSV file...');
        reader.readAsText(csvFile);
      } else {
        // Handle Excel files
        try {
          console.log('Processing Excel file...');
          const arrayBuffer = await csvFile.arrayBuffer();
          const workbook = XLSX.read(arrayBuffer, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          console.log('Excel data:', jsonData);
          
          if (jsonData.length < 2) {
            throw new Error('Excel file must have at least a header row and one data row');
          }
          
          const headers = (jsonData[0] as string[]).map(h => h.trim().toLowerCase());
          console.log('Headers:', headers);
          
          if (!headers.includes('email') || !headers.includes('status')) {
            throw new Error('Excel file must contain "email" and "status" columns');
          }
          
          fileData = [];
          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i] as string[];
            if (row.length > 0 && row.some(cell => cell && cell.toString().trim())) {
              const rowData: any = {};
              headers.forEach((header, index) => {
                rowData[header] = row[index] || '';
              });
              fileData.push(rowData);
            }
          }
          
          console.log('Parsed Excel data:', fileData);
          console.log('Number of rows:', fileData.length);
          
          await processFileData(fileData);
        } catch (err: any) {
          console.error('Error in Excel processing:', err);
          setError(err.message || 'Failed to process Excel file');
          setCsvUploading(false);
        }
      }
    } catch (err: any) {
      console.error('Error in handleCsvUpload:', err);
      setError(err.message || 'Failed to read CSV file');
      setCsvUploading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'primary';
      case 'contacted':
        return 'warning';
      case 'qualified':
        return 'success';
      case 'proposal':
        return 'secondary';
      case 'negotiation':
        return 'info';
      case 'closed_won':
        return 'success';
      case 'closed_lost':
        return 'error';
      case 'unsubscribed':
        return 'error';
      case 'wrong-email':
        return 'error';
      case 'inactive':
        return 'default';
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
              {displaySearchTerm && (
                <span style={{ color: '#6366f1', fontWeight: 600 }}>
                  {' '}• {totalContacts} search result{totalContacts !== 1 ? 's' : ''} for "{displaySearchTerm}"
                </span>
              )}
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
            <Button
              variant="outlined"
              startIcon={<Update />}
              onClick={() => setCsvUploadOpen(true)}
              sx={{
                borderColor: '#f59e0b',
                color: '#f59e0b',
                '&:hover': {
                  borderColor: '#d97706',
                  backgroundColor: 'rgba(245, 158, 11, 0.1)',
                },
              }}
            >
              Upload Statuses
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

      {/* Filter chips bar */}
      <Box mb={2} display="flex" flexWrap="wrap" gap={1}>
        {getActiveFilterChips().map(chip => (
          <Chip
            key={chip.key}
            label={`${chip.label}: ${chip.value}`}
            onDelete={() => handleChipDelete(chip.key)}
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
        ))}
      </Box>

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
                placeholder="Search by name, company, email, phone, title..."
                variant="outlined"
                size="small"
                value={displaySearchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: '#64748b' }} />,
                  endAdornment: searching ? (
                    <CircularProgress size={20} sx={{ color: '#6366f1' }} />
                  ) : null,
                }}
                sx={{
                  minWidth: 300,
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
                  disabled={loadingStatuses}
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
                  {statuses.map((status) => (
                    <MenuItem key={status.value} value={status.value}>
                      {status.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Autocomplete
                multiple
                options={filterOptions.companies}
                getOptionLabel={option => option.name}
                value={filterOptions.companies.filter(c => filters.company.includes(c.id))}
                onChange={(_, value) => setFilters(prev => ({ ...prev, company: value.map(v => v.id) }))}
                renderInput={params => <TextField {...params} label="Company" size="small" margin="dense" />} 
                filterSelectedOptions
                disableCloseOnSelect
                sx={{ minWidth: 220 }}
              />
              <Autocomplete
                multiple
                options={filterOptions.departments}
                getOptionLabel={option => option.name}
                value={filterOptions.departments.filter(d => filters.department.includes(d.id))}
                onChange={(_, value) => setFilters(prev => ({ ...prev, department: value.map(v => v.id) }))}
                renderInput={params => <TextField {...params} label="Department" size="small" margin="dense" />} 
                filterSelectedOptions
                disableCloseOnSelect
                sx={{ minWidth: 180 }}
              />
              <Autocomplete
                multiple
                options={filterOptions.industries}
                value={filters.industry}
                onChange={(_, value) => setFilters(prev => ({ ...prev, industry: value }))}
                renderInput={params => <TextField {...params} label="Industry" size="small" margin="dense" />} 
                filterSelectedOptions
                disableCloseOnSelect
                sx={{ minWidth: 180 }}
              />
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
                          <FormControl size="small" sx={{ minWidth: 120 }}>
                            <Select
                              value={contact.status || 'new'}
                              onChange={(e) => handleStatusChange(contact.id, e.target.value)}
                              size="small"
                              sx={{
                                '& .MuiOutlinedInput-notchedOutline': {
                                  border: 'none',
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                  border: 'none',
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                  border: 'none',
                                },
                              }}
                            >
                              {statuses.map((status) => (
                                <MenuItem key={status.value} value={status.value}>
                                  <Chip
                                    label={status.label}
                                    color={getStatusColor(status.value) as any}
                                    size="small"
                                    sx={{ fontWeight: 600 }}
                                  />
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
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

      {/* CSV Upload Dialog */}
      <Dialog 
        open={csvUploadOpen} 
        onClose={() => setCsvUploadOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Upload Status Updates
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Upload a CSV or Excel file (.csv, .xlsx, .xls) with "email" and "status" columns to bulk update contact statuses.
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <input
              accept=".csv,.xlsx,.xls"
              style={{ display: 'none' }}
              id="csv-file-input"
              type="file"
              onChange={handleCsvFileChange}
            />
            <label htmlFor="csv-file-input">
              <Button
                variant="outlined"
                component="span"
                startIcon={<Upload />}
                fullWidth
              >
                {csvFile ? csvFile.name : 'Choose CSV File'}
              </Button>
            </label>
          </Box>

          {csvFile && (
            <Alert severity="info" sx={{ mb: 2 }}>
              File selected: {csvFile.name}
            </Alert>
          )}

          {csvResults && (
            <Alert severity="success" sx={{ mb: 2 }}>
              <Typography variant="body2">
                Upload completed!<br />
                Total rows: {csvResults.total_rows}<br />
                Updated: {csvResults.updated}<br />
                Not found: {csvResults.not_found}
              </Typography>
              {csvResults.errors.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" color="error">
                    Errors: {csvResults.errors.length}
                  </Typography>
                </Box>
              )}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCsvUploadOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCsvUpload}
            disabled={!csvFile || csvUploading}
            variant="contained"
            startIcon={csvUploading ? <CircularProgress size={20} /> : <Update />}
          >
            {csvUploading ? 'Uploading...' : 'Upload & Update'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
  
  export default ContactListPage;