import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Save,
  Cancel,
  ArrowBack,
  Add,
  Delete,
  Email,
  Phone,
} from '@mui/icons-material';
import api from '../config/axiosConfig';

interface Email {
  id?: number;
  contact_id?: number;
  email: string;
  type: string;
  is_primary?: boolean;
}

interface Phone {
  id?: number;
  contact_id?: number;
  phone: string;
  type: string;
}

interface Company {
  id: number;
  name: string;
  industry?: string;
  city?: string;
}

interface Department {
  id: number;
  name: string;
}

interface Contact {
  id: number;
  first_name?: string;
  last_name?: string;
  title?: string;
  seniority?: string;
  status?: string;
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
  emails: Email[];
  phones: Phone[];
  company?: Company;
  department?: Department;
  created_at: string;
  updated_at: string;
}

interface Status {
  value: string;
  label: string;
  color: string;
}

const ContactEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    if (id) {
      fetchContact();
      fetchStatuses();
    }
  }, [id]);

  useEffect(() => {
    if (contact) {
      fetchDepartments();
      fetchCompanies();
    }
  }, [contact]);

  const fetchContact = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/contacts/${id}`);
      setContact(response.data.contact);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch contact');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatuses = async () => {
    try {
      const response = await api.get('/contacts/statuses');
      setStatuses(response.data.statuses);
    } catch (err: any) {
      console.error('Failed to fetch statuses:', err);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await api.get('/companies');
      let companiesList = response.data.companies || [];
      
      // Add current company if it exists and is not in the list
      if (contact?.company && !companiesList.find((c: Company) => c.id === contact.company?.id)) {
        companiesList = [contact.company, ...companiesList];
      }
      
      setCompanies(companiesList);
    } catch (err: any) {
      console.error('Failed to fetch companies:', err);
      // If API fails, at least show the current company if it exists
      if (contact?.company) {
        setCompanies([contact.company]);
      } else {
        setCompanies([]);
      }
    }
  };

  const fetchDepartments = async () => {
    try {
      // Use department from contact response if available, otherwise fetch from API
      if (contact?.department) {
        setDepartments([contact.department]);
      } else {
        const response = await api.get('/contacts/departments');
        setDepartments(response.data.departments || []);
      }
    } catch (err: any) {
      console.error('Failed to fetch departments:', err);
      // If API fails, at least show the current department if it exists
      if (contact?.department) {
        setDepartments([contact.department]);
      } else {
        setDepartments([]);
      }
    }
  };

  const handleSave = async () => {
    if (!contact) return;

    try {
      setSaving(true);
      await api.put(`/contacts/${id}`, contact);
      navigate(`/contacts/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update contact');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof Contact, value: any) => {
    if (!contact) return;
    setContact({ ...contact, [field]: value });
  };

  const handleEmailChange = (index: number, field: keyof Email, value: any) => {
    if (!contact) return;
    const updatedEmails = [...contact.emails];
    updatedEmails[index] = { ...updatedEmails[index], [field]: value };
    setContact({ ...contact, emails: updatedEmails });
  };

  const handlePhoneChange = (index: number, field: keyof Phone, value: any) => {
    if (!contact) return;
    const updatedPhones = [...contact.phones];
    updatedPhones[index] = { ...updatedPhones[index], [field]: value };
    setContact({ ...contact, phones: updatedPhones });
  };

  const addEmail = () => {
    if (!contact) return;
    const newEmail: Email = {
      email: '',
      type: 'primary',
      is_primary: false,
    };
    setContact({ ...contact, emails: [...contact.emails, newEmail] });
  };

  const addPhone = () => {
    if (!contact) return;
    const newPhone: Phone = {
      phone: '',
      type: 'work',
    };
    setContact({ ...contact, phones: [...contact.phones, newPhone] });
  };

  const removeEmail = (index: number) => {
    if (!contact) return;
    const updatedEmails = contact.emails.filter((_, i) => i !== index);
    setContact({ ...contact, emails: updatedEmails });
  };

  const removePhone = (index: number) => {
    if (!contact) return;
    const updatedPhones = contact.phones.filter((_, i) => i !== index);
    setContact({ ...contact, phones: updatedPhones });
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/contacts')}
        >
          Back to Contacts
        </Button>
      </Box>
    );
  }

  if (!contact) {
    return (
      <Box>
        <Alert severity="warning" sx={{ mb: 3 }}>
          Contact not found
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/contacts')}
        >
          Back to Contacts
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate(`/contacts/${id}`)}
            sx={{ mb: 1 }}
          >
            Back to Contact
          </Button>
          <Typography variant="h4" gutterBottom>
            Edit Contact
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<Cancel />}
            onClick={() => navigate(`/contacts/${id}`)}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={contact.first_name || ''}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={contact.last_name || ''}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Title"
                    value={contact.title || ''}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Seniority"
                    value={contact.seniority || ''}
                    onChange={(e) => handleInputChange('seniority', e.target.value)}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={contact.status || 'new'}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      label="Status"
                    >
                      {statuses.map((status) => (
                        <MenuItem key={status.value} value={status.value}>
                          <Chip
                            label={status.label}
                            color={getStatusColor(status.value) as any}
                            size="small"
                            sx={{ mr: 1 }}
                          />
                          {status.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Stage"
                    value={contact.stage || ''}
                    onChange={(e) => handleInputChange('stage', e.target.value)}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Lists"
                    value={contact.lists || ''}
                    onChange={(e) => handleInputChange('lists', e.target.value)}
                    margin="normal"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Company & Department */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Company & Department
              </Typography>
              <Grid container spacing={2}>
                                 <Grid item xs={12}>
                   <FormControl fullWidth margin="normal">
                     <InputLabel>Company</InputLabel>
                     <Select
                       value={contact.company?.id || ''}
                       onChange={(e) => {
                         const companyId = e.target.value;
                         const selectedCompany = companies.find(c => c.id === companyId);
                         setContact({ ...contact, company: selectedCompany });
                       }}
                       label="Company"
                     >
                       <MenuItem value="">
                         <em>No company</em>
                       </MenuItem>
                       {/* Add current company if it's not in the companies list */}
                       {contact.company && !companies.find(c => c.id === contact.company?.id) && (
                         <MenuItem value={contact.company.id}>
                           {contact.company.name} (Current)
                         </MenuItem>
                       )}
                       {companies.map((company) => (
                         <MenuItem key={company.id} value={company.id}>
                           {company.name}
                         </MenuItem>
                       ))}
                     </Select>
                   </FormControl>
                   {contact.company && (
                     <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                       Current: {contact.company.name}
                     </Typography>
                   )}
                 </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Department</InputLabel>
                    <Select
                      value={contact.department?.id || ''}
                      onChange={(e) => {
                        const deptId = e.target.value;
                        const selectedDept = departments.find(d => d.id === deptId);
                        setContact({ ...contact, department: selectedDept });
                      }}
                      label="Department"
                    >
                      <MenuItem value="">
                        <em>No department</em>
                      </MenuItem>
                      {departments.map((dept) => (
                        <MenuItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  {contact.department && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Current: {contact.department.name}
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Address Information */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Address Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    value={contact.address || ''}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    margin="normal"
                    multiline
                    rows={2}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="City"
                    value={contact.city || ''}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="State"
                    value={contact.state || ''}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Country"
                    value={contact.country || ''}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Postal Code"
                    value={contact.postal_code || ''}
                    onChange={(e) => handleInputChange('postal_code', e.target.value)}
                    margin="normal"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Emails */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  Emails
                </Typography>
                <Button
                  startIcon={<Add />}
                  onClick={addEmail}
                  size="small"
                >
                  Add Email
                </Button>
              </Box>
              {contact.emails.map((email, index) => (
                <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={8}>
                      <TextField
                        fullWidth
                        label="Email"
                        value={email.email}
                        onChange={(e) => handleEmailChange(index, 'email', e.target.value)}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Type</InputLabel>
                        <Select
                          value={email.type}
                          onChange={(e) => handleEmailChange(index, 'type', e.target.value)}
                          label="Type"
                        >
                          <MenuItem value="primary">Primary</MenuItem>
                          <MenuItem value="secondary">Secondary</MenuItem>
                          <MenuItem value="tertiary">Tertiary</MenuItem>
                          <MenuItem value="personal">Personal</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={1}>
                      <Tooltip title="Remove Email">
                        <IconButton
                          size="small"
                          onClick={() => removeEmail(index)}
                          color="error"
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Phones */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  Phones
                </Typography>
                <Button
                  startIcon={<Add />}
                  onClick={addPhone}
                  size="small"
                >
                  Add Phone
                </Button>
              </Box>
              {contact.phones.map((phone, index) => (
                <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={8}>
                      <TextField
                        fullWidth
                        label="Phone"
                        value={phone.phone}
                        onChange={(e) => handlePhoneChange(index, 'phone', e.target.value)}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Type</InputLabel>
                        <Select
                          value={phone.type}
                          onChange={(e) => handlePhoneChange(index, 'type', e.target.value)}
                          label="Type"
                        >
                          <MenuItem value="work">Work</MenuItem>
                          <MenuItem value="mobile">Mobile</MenuItem>
                          <MenuItem value="home">Home</MenuItem>
                          <MenuItem value="corporate">Corporate</MenuItem>
                          <MenuItem value="other">Other</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={1}>
                      <Tooltip title="Remove Phone">
                        <IconButton
                          size="small"
                          onClick={() => removePhone(index)}
                          color="error"
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Additional Information */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Additional Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="LinkedIn URL"
                    value={contact.person_linkedin_url || ''}
                    onChange={(e) => handleInputChange('person_linkedin_url', e.target.value)}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Contact Owner"
                    value={contact.contact_owner || ''}
                    onChange={(e) => handleInputChange('contact_owner', e.target.value)}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Contacted"
                    type="date"
                    value={contact.last_contacted || ''}
                    onChange={(e) => handleInputChange('last_contacted', e.target.value)}
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ContactEditPage; 