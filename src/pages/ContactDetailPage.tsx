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
  emails: { id: number; contact_id: number; email: string; type: string; is_primary?: boolean }[];
  phones: { id: number; contact_id: number; phone: string; type: string }[];
  company?: {
    id: number;
    name: string;
    industry?: string;
    city?: string;
    phone?: string;
  };
  department?: { id: number; name: string } | null;
  tags?: string;
  lead_status?: string;
  created_at: string;
  updated_at: string;
  owner_first_name?: string;
  owner_last_name?: string;
  city?: string;
  state?: string;
  country?: string;
  address?: string;
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
              label={contact.lead_status || 'new'}
              color={getStatusColor((contact.lead_status || 'new') as string) as any}
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
                    Emails
                  </Typography>
                  {contact.emails && contact.emails.length > 0 ? (
                    contact.emails.map((emailObj) => (
                      <Typography variant="body1" key={emailObj.id}>
                        {emailObj.email} ({emailObj.type})
                      </Typography>
                    ))
                  ) : (
                    <Typography variant="body1">N/A</Typography>
                  )}
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Phones
                  </Typography>
                  {contact.phones && contact.phones.length > 0 ? (
                    contact.phones
                      .filter(phoneObj => phoneObj.phone && phoneObj.phone.trim() !== '')
                      .map((phoneObj) => (
                        <Typography variant="body1" key={phoneObj.id}>
                          {phoneObj.phone.replace(/^'+|'+$/g, '')}{' '}
                          <span style={{ color: '#a0aec0', marginLeft: 4 }}>
                            ({phoneObj.type || 'other'})
                          </span>
                        </Typography>
                      ))
                  ) : (
                    <Typography variant="body1">N/A</Typography>
                  )}
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
                    Company
                  </Typography>
                  <Typography variant="body1">
                    {contact.company ? `${contact.company.name}${contact.company.industry ? ' - ' + contact.company.industry : ''}${contact.company.city ? ', ' + contact.company.city : ''}${contact.company.phone ? ' (Phone: ' + contact.company.phone + ')' : ''}` : 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Department
                  </Typography>
                  <Typography variant="body1">
                    {contact.department?.name || 'N/A'}
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
                {contact.address && contact.address.trim() !== '' && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Address
                    </Typography>
                    <Typography variant="body1">
                      {contact.address}
                    </Typography>
                  </Grid>
                )}
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">
                    City
                  </Typography>
                  <Typography variant="body1">
                    {contact.city || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">
                    State
                  </Typography>
                  <Typography variant="body1">
                    {contact.state || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
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