import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Edit, ArrowBack, Delete } from '@mui/icons-material';
import api from '../config/axiosConfig';

interface Contact {
  id: number;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  job_title?: string;
  department?: string;
  company_name?: string;
  company_email?: string;
  company_phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  lead_source?: string;
  lead_status: string;
  notes?: string;
  tags?: string;
  custom_fields?: Record<string, any>;
  created_at: string;
  updated_at: string;
  owner_first_name?: string;
  owner_last_name?: string;
}

const ContactDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchContact();
    }
  }, [id]);

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

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await api.delete(`/contacts/${id}`);
        navigate('/contacts');
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to delete contact');
      }
    }
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
    return new Date(dateString).toLocaleString();
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
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/contacts')}
            sx={{ mb: 2 }}
          >
            Back to Contacts
          </Button>
          <Typography variant="h4" gutterBottom>
            {contact.full_name || 
             `${contact.first_name || ''} ${contact.last_name || ''}`.trim() || 
             'Contact Details'}
          </Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <Chip
              label={contact.lead_status}
              color={getStatusColor(contact.lead_status) as any}
            />
            {contact.tags && (
              <Typography variant="body2" color="text.secondary">
                Tags: {contact.tags}
              </Typography>
            )}
          </Box>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={() => navigate(`/contacts/${contact.id}/edit`)}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<Delete />}
            onClick={handleDelete}
          >
            Delete
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    First Name
                  </Typography>
                  <Typography variant="body1">
                    {contact.first_name || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Last Name
                  </Typography>
                  <Typography variant="body1">
                    {contact.last_name || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1">
                    {contact.email || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Phone
                  </Typography>
                  <Typography variant="body1">
                    {contact.phone || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Mobile
                  </Typography>
                  <Typography variant="body1">
                    {contact.mobile || 'N/A'}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Professional Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Job Title
                  </Typography>
                  <Typography variant="body1">
                    {contact.job_title || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Department
                  </Typography>
                  <Typography variant="body1">
                    {contact.department || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Company
                  </Typography>
                  <Typography variant="body1">
                    {contact.company_name || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Lead Source
                  </Typography>
                  <Typography variant="body1">
                    {contact.lead_source || 'N/A'}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Address Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Address
                  </Typography>
                  <Typography variant="body1">
                    {contact.address || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="body2" color="text.secondary">
                    City
                  </Typography>
                  <Typography variant="body1">
                    {contact.city || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="body2" color="text.secondary">
                    State
                  </Typography>
                  <Typography variant="body1">
                    {contact.state || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="body2" color="text.secondary">
                    Postal Code
                  </Typography>
                  <Typography variant="body1">
                    {contact.postal_code || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="body2" color="text.secondary">
                    Country
                  </Typography>
                  <Typography variant="body1">
                    {contact.country || 'N/A'}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {contact.notes && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Notes
                </Typography>
                <Typography variant="body1">
                  {contact.notes}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}

        {contact.custom_fields && Object.keys(contact.custom_fields).length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Custom Fields
                </Typography>
                <Grid container spacing={2}>
                  {Object.entries(contact.custom_fields).map(([key, value]) => (
                    <Grid item xs={12} sm={6} key={key}>
                      <Typography variant="body2" color="text.secondary">
                        {key}
                      </Typography>
                      <Typography variant="body1">
                        {String(value)}
                      </Typography>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Owner
                  </Typography>
                  <Typography variant="body1">
                    {contact.owner_first_name || contact.owner_last_name
                      ? `${contact.owner_first_name || ''} ${contact.owner_last_name || ''}`.trim()
                      : 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Created
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(contact.created_at)}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ContactDetailPage;