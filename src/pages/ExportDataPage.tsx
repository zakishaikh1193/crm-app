import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Card,
  Chip,
  Autocomplete,
  Checkbox,
  FormControlLabel,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Pagination,
} from '@mui/material';
import { FilterList } from '@mui/icons-material';
import api from '../config/axiosConfig';
import * as XLSX from 'xlsx';

interface FilterOptions {
  companies: { id: number; name: string }[];
  industries: string[];
  departments: { id: number; name: string }[];
  owners: { id: number; first_name: string; last_name: string }[];
  cities: string[];
  states: string[];
  countries: string[];
  stages: string[];
  titles: string[];
  seniorities: string[];
}

interface Filters {
  company: number[];
  title: string[];
  seniority: string[];
  industry: string[];
  department: number[];
  city: string[];
  state: string[];
  country: string[];
  stage: string[];
  owner: number[];
  has_email: boolean | null;
  has_phone: boolean | null;
}

const initialFilters: Filters = {
  company: [],
  title: [],
  seniority: [],
  industry: [],
  department: [],
  city: [],
  state: [],
  country: [],
  stage: [],
  owner: [],
  has_email: null,
  has_phone: null,
};

interface Email {
  id: number;
  contact_id: number;
  email: string;
  type: string;
  is_primary?: boolean;
  status?: string;
  source?: string;
  confidence?: string;
  catch_all_status?: string;
  last_verified_at?: string;
  unsubscribe?: boolean | number;
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
  state?: string;
  country?: string;
  website?: string;
  linkedin_url?: string;
  facebook_url?: string;
  twitter_url?: string;
  num_employees?: number;
  annual_revenue?: number;
  total_funding?: number;
  latest_funding?: number;
  latest_funding_amount?: number;
  last_raised_at?: string;
  address?: string;
  phone?: string;
  seo_description?: string;
  keywords?: string;
  subsidiary_of?: string;
  custom_fields?: any;
  created_at?: string;
  updated_at?: string;
}

interface Department {
  id: number;
  name: string;
}
interface Owner {
  id: number;
  first_name?: string;
  last_name?: string;
  email?: string;
  role?: string;
}
interface Contact {
  id: number;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  title?: string;
  seniority?: string;
  stage?: string;
  lists?: string;
  last_contacted?: string;
  person_linkedin_url?: string;
  contact_owner?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  custom_fields?: any;
  created_at: string;
  updated_at?: string;
  company?: Company | null;
  department?: Department | null;
  owner?: Owner | null;
  emails: Email[];
  phones: Phone[];
}

// Add this function to flatten contact data for Excel
function flattenContact(contact: Contact) {
  // Helper to get email/phone by type
  const getEmail = (type: string): string => contact.emails?.find((e: any) => e.type === type)?.email || '';
  const getEmailSource = (type: string): string => contact.emails?.find((e: any) => e.type === type)?.source || '';
  const getEmailStatus = (type: string): string => contact.emails?.find((e: any) => e.type === type)?.status || '';
  const getEmailConfidence = (type: string): string => contact.emails?.find((e: any) => e.type === type)?.confidence || '';
  const getEmailCatchAll = (type: string): string => contact.emails?.find((e: any) => e.type === type)?.catch_all_status || '';
  const getEmailVerified = (type: string): string => contact.emails?.find((e: any) => e.type === type)?.last_verified_at || '';
  const getPhone = (type: string): string => contact.phones?.find((p: any) => p.type === type)?.phone || '';
  // Flatten fields
  return {
    'First Name': contact.first_name || '',
    'Last Name': contact.last_name || '',
    'Title': contact.title || '',
    'Company': contact.company?.name || '',
    'Company Name for Emails': contact.company?.name || '',
    'Email': getEmail('primary'),
    'Email Status': getEmailStatus('primary'),
    'Primary Email Source': getEmailSource('primary'),
    'Email Confidence': getEmailConfidence('primary'),
    'Primary Email Catch-all Status': getEmailCatchAll('primary'),
    'Primary Email Last Verified At': getEmailVerified('primary'),
    'Seniority': contact.seniority || '',
    'Departments': contact.department?.name || '',
    'Contact Owner': contact.owner ? `${contact.owner.first_name || ''} ${contact.owner.last_name || ''}`.trim() : '',
    'Work Direct Phone': getPhone('work'),
    'Home Phone': getPhone('home'),
    'Mobile Phone': getPhone('mobile'),
    'Corporate Phone': getPhone('corporate'),
    'Other Phone': getPhone('other'),
    'Stage': contact.stage || '',
    'Lists': contact.lists || '',
    'Last Contacted': contact.last_contacted || '',
    'Account Owner': contact.owner ? `${contact.owner.first_name || ''} ${contact.owner.last_name || ''}`.trim() : '',
    '# Employees': contact.company?.num_employees || '',
    'Industry': contact.company?.industry || '',
    'Keywords': contact.company?.keywords || '',
    'Person Linkedin Url': contact.person_linkedin_url || '',
    'Website': contact.company?.website || '',
    'Company Linkedin Url': contact.company?.linkedin_url || '',
    'Facebook Url': contact.company?.facebook_url || '',
    'Twitter Url': contact.company?.twitter_url || '',
    'City': contact.city || '',
    'State': contact.state || '',
    'Country': contact.country || '',
    'Company Address': contact.company?.address || '',
    'Company City': contact.company?.city || '',
    'Company State': contact.company?.state || '',
    'Company Country': contact.company?.country || '',
    'Company Phone': contact.company?.phone || '',
    'SEO Description': contact.company?.seo_description || '',
    'Annual Revenue': contact.company?.annual_revenue || '',
    'Total Funding': contact.company?.total_funding || '',
    'Latest Funding': contact.company?.latest_funding || '',
    'Latest Funding Amount': contact.company?.latest_funding_amount || '',
    'Last Raised At': contact.company?.last_raised_at || '',
    'Subsidiary of': contact.company?.subsidiary_of || '',
    'Secondary Email': getEmail('secondary'),
    'Secondary Email Source': getEmailSource('secondary'),
    'Tertiary Email': getEmail('tertiary'),
    'Tertiary Email Source': getEmailSource('tertiary'),
    // Add more fields as needed, leave blank if not available
    'Unsubscribe': contact.emails?.find((e: any) => e.type === 'primary')?.unsubscribe || '',
  };
}

const ExportDataPage: React.FC = () => {
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    companies: [],
    industries: [],
    departments: [],
    owners: [],
    cities: [],
    states: [],
    countries: [],
    stages: [],
    titles: [],
    seniorities: [],
  });
  const [filters, setFilters] = useState<Filters>({ ...initialFilters });
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [totalContacts, setTotalContacts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const res = await api.get('/contacts/filter-options');
        setFilterOptions(res.data);
      } catch (err) {
        // Optionally handle error
      }
    };
    fetchOptions();
  }, []);

  // Fetch contacts when filters or page changes
  useEffect(() => {
    const fetchContacts = async () => {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: itemsPerPage.toString(),
        });
        // Add filters to params (use pipe | as delimiter for multi-select)
        if (filters.company.length) params.append('company', filters.company.join('|'));
        if (filters.title.length) params.append('title', filters.title.join('|'));
        if (filters.seniority.length) params.append('seniority', filters.seniority.join('|'));
        if (filters.industry.length) params.append('industry', filters.industry.join('|'));
        if (filters.department.length) params.append('department', filters.department.join('|'));
        if (filters.city.length) params.append('city', filters.city.join('|'));
        if (filters.state.length) params.append('state', filters.state.join('|'));
        if (filters.country.length) params.append('country', filters.country.join('|'));
        if (filters.stage.length) params.append('stage', filters.stage.join('|'));
        if (filters.owner.length) params.append('owner', filters.owner.join('|'));
        if (filters.has_email !== null) params.append('has_email', filters.has_email ? '1' : '0');
        if (filters.has_phone !== null) params.append('has_phone', filters.has_phone ? '1' : '0');
        const res = await api.get(`/contacts?${params.toString()}`);
        setContacts(res.data.contacts);
        setTotalContacts(res.data.pagination.total);
        setTotalPages(res.data.pagination.total_pages);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to fetch contacts');
      } finally {
        setLoading(false);
      }
    };
    fetchContacts();
    // eslint-disable-next-line
  }, [filters, currentPage]);

  // Reset page to 1 when filters change
  useEffect(() => { setCurrentPage(1); }, [filters]);

  // Helper to build chips for active filters
  const getActiveFilterChips = () => {
    const chips: { label: string; value: string; key: keyof Filters }[] = [];
    if (filters.company.length) chips.push({ label: 'Company', value: filterOptions.companies.filter(c => filters.company.includes(c.id)).map(c => c.name).join(', '), key: 'company' });
    if (filters.title.length) chips.push({ label: 'Title', value: filters.title.join(', '), key: 'title' });
    if (filters.seniority.length) chips.push({ label: 'Seniority', value: filters.seniority.join(', '), key: 'seniority' });
    if (filters.industry.length) chips.push({ label: 'Industry', value: filters.industry.join(', '), key: 'industry' });
    if (filters.department.length) chips.push({ label: 'Department', value: filterOptions.departments.filter(d => filters.department.includes(d.id)).map(d => d.name).join(', '), key: 'department' });
    if (filters.city.length) chips.push({ label: 'City', value: filters.city.join(', '), key: 'city' });
    if (filters.state.length) chips.push({ label: 'State', value: filters.state.join(', '), key: 'state' });
    if (filters.country.length) chips.push({ label: 'Country', value: filters.country.join(', '), key: 'country' });
    if (filters.stage.length) chips.push({ label: 'Stage', value: filters.stage.join(', '), key: 'stage' });
    if (filters.owner.length) chips.push({ label: 'Owner', value: filterOptions.owners.filter(o => filters.owner.includes(o.id)).map(o => `${o.first_name} ${o.last_name}`).join(', '), key: 'owner' });
    if (filters.has_email !== null) chips.push({ label: 'Has Email', value: filters.has_email ? 'Yes' : 'No', key: 'has_email' });
    if (filters.has_phone !== null) chips.push({ label: 'Has Phone', value: filters.has_phone ? 'Yes' : 'No', key: 'has_phone' });
    return chips;
  };

  const handleChipDelete = (key: keyof Filters) => {
    setFilters(prev => ({ ...prev, [key]: Array.isArray(prev[key]) ? [] : (typeof prev[key] === 'boolean' ? null : '') }));
  };

  const handleFilterChange = (key: keyof Filters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Add export handler
  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      params.set('limit', '10000000');
      params.set('page', '1');
      if (filters.company.length) params.set('company', filters.company.join('|'));
      if (filters.title.length) params.set('title', filters.title.join('|'));
      if (filters.seniority.length) params.set('seniority', filters.seniority.join('|'));
      if (filters.industry.length) params.set('industry', filters.industry.join('|'));
      if (filters.department.length) params.set('department', filters.department.join('|'));
      if (filters.city.length) params.set('city', filters.city.join('|'));
      if (filters.state.length) params.set('state', filters.state.join('|'));
      if (filters.country.length) params.set('country', filters.country.join('|'));
      if (filters.stage.length) params.set('stage', filters.stage.join('|'));
      if (filters.owner.length) params.set('owner', filters.owner.join('|'));
      if (filters.has_email !== null) params.set('has_email', filters.has_email ? '1' : '0');
      if (filters.has_phone !== null) params.set('has_phone', filters.has_phone ? '1' : '0');
      const res = await api.get(`/contacts?${params.toString()}`);
      const allContacts = res.data.contacts || [];
      const data = allContacts.map(flattenContact);
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Contacts');
      const today = new Date();
      const fileName = `contacts_export_${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}.xlsx`;
      XLSX.writeFile(wb, fileName);
    } catch (err) {
      alert('Failed to export contacts.');
    }
  };

  return (
    <Box>
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
      {/* Top filter bar */}
      <Card sx={{ mb: 3, p: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', boxShadow: '0 4px 16px rgba(99,102,241,0.07)' }}>
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
          options={filterOptions.titles}
          value={filters.title}
          onChange={(_, value) => setFilters(prev => ({ ...prev, title: value }))}
          renderInput={params => <TextField {...params} label="Title" size="small" margin="dense" />} 
          filterSelectedOptions
          disableCloseOnSelect
          freeSolo
          sx={{ minWidth: 180 }}
        />
        <Autocomplete
          multiple
          options={filterOptions.seniorities}
          value={filters.seniority}
          onChange={(_, value) => setFilters(prev => ({ ...prev, seniority: value }))}
          renderInput={params => <TextField {...params} label="Seniority" size="small" margin="dense" />} 
          filterSelectedOptions
          disableCloseOnSelect
          freeSolo
          sx={{ minWidth: 180 }}
        />
      </Card>
      {/* Sidebar filters (rendered inline as a section) */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Autocomplete
          multiple
          options={filterOptions.industries}
          value={filters.industry}
          onChange={(_, value) => handleFilterChange('industry', value)}
          renderInput={params => <TextField {...params} label="Industry" size="small" margin="dense" />} sx={{ minWidth: 180 }} />
        <Autocomplete
          multiple
          options={filterOptions.departments}
          getOptionLabel={option => option.name}
          value={filterOptions.departments.filter(d => filters.department.includes(d.id))}
          onChange={(_, value) => handleFilterChange('department', value.map(v => v.id))}
          renderInput={params => <TextField {...params} label="Department" size="small" margin="dense" />} sx={{ minWidth: 180 }} />
        <Autocomplete
          multiple
          options={filterOptions.cities}
          value={filters.city}
          onChange={(_, value) => handleFilterChange('city', value)}
          renderInput={params => <TextField {...params} label="City" size="small" margin="dense" />} sx={{ minWidth: 140 }} />
        <Autocomplete
          multiple
          options={filterOptions.states}
          value={filters.state}
          onChange={(_, value) => handleFilterChange('state', value)}
          renderInput={params => <TextField {...params} label="State" size="small" margin="dense" />} sx={{ minWidth: 140 }} />
        <Autocomplete
          multiple
          options={filterOptions.countries}
          value={filters.country}
          onChange={(_, value) => handleFilterChange('country', value)}
          renderInput={params => <TextField {...params} label="Country" size="small" margin="dense" />} sx={{ minWidth: 140 }} />
        <Autocomplete
          multiple
          options={filterOptions.stages}
          value={filters.stage}
          onChange={(_, value) => handleFilterChange('stage', value)}
          renderInput={params => <TextField {...params} label="Stage" size="small" margin="dense" />} sx={{ minWidth: 140 }} />
        <Autocomplete
          multiple
          options={filterOptions.owners}
          getOptionLabel={option => `${option.first_name} ${option.last_name}`}
          value={filterOptions.owners.filter(o => filters.owner.includes(o.id))}
          onChange={(_, value) => handleFilterChange('owner', value.map(v => v.id))}
          renderInput={params => <TextField {...params} label="Owner" size="small" margin="dense" />} sx={{ minWidth: 180 }} />
        <FormControlLabel
          control={<Checkbox checked={filters.has_email === true} onChange={e => handleFilterChange('has_email', e.target.checked ? true : null)} />}
          label="Has Email"
        />
        <FormControlLabel
          control={<Checkbox checked={filters.has_phone === true} onChange={e => handleFilterChange('has_phone', e.target.checked ? true : null)} />}
          label="Has Phone"
        />
        <Button variant="outlined" color="primary" sx={{ minWidth: 120 }} onClick={() => setFilters({ ...initialFilters })}>
          Reset Filters
        </Button>
      </Box>
      <Box sx={{ p: 4, textAlign: 'center', color: '#64748b' }}>
        <Typography variant="h5" fontWeight={700} mb={2}>Export Data</Typography>
        <Typography variant="body1">Use the filters above and in the sidebar to select the data you want to export.</Typography>
      </Box>
      {/* Add Export button above contacts table */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" color="primary" onClick={handleExport}>
          Export to Excel
        </Button>
      </Box>
      {/* Contacts Table and Total Count */}
      <Card sx={{ mt: 2, p: 2, boxShadow: '0 4px 16px rgba(99,102,241,0.07)' }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6" fontWeight={700}>
            Contacts ({totalContacts} found)
          </Typography>
          {loading && <CircularProgress size={24} sx={{ ml: 2 }} />}
        </Box>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Company</TableCell>
                <TableCell>Created</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {contacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell>
                    {contact.full_name || `${contact.first_name || ''} ${contact.last_name || ''}`}
                  </TableCell>
                  <TableCell>
                    {contact.emails && contact.emails.length > 0 ?
                      contact.emails.find(e => e.is_primary)?.email || contact.emails[0].email :
                      <span style={{ color: '#94a3b8' }}>No email</span>}
                  </TableCell>
                  <TableCell>
                    {contact.phones && contact.phones.length > 0 ?
                      contact.phones[0].phone :
                      <span style={{ color: '#94a3b8' }}>No phone</span>}
                  </TableCell>
                  <TableCell>
                    {contact.company ? contact.company.name : <span style={{ color: '#94a3b8' }}>No company</span>}
                  </TableCell>
                  <TableCell>
                    {new Date(contact.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
              {!loading && contacts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ color: '#94a3b8' }}>
                    No contacts found for the selected filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
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
        )}
      </Card>
    </Box>
  );
};

export default ExportDataPage; 