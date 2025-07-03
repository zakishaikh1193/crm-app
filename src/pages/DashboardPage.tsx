import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
} from '@mui/material';
import {
  People,
  Business,
  TrendingUp,
  Add,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../config/axiosConfig';
import { useAuth } from '../contexts/AuthContext';

interface DashboardStats {
  totalContacts: number;
  totalCompanies: number;
  recentContacts: number;
  leadConversionRate: number;
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalContacts: 0,
    totalCompanies: 0,
    recentContacts: 0,
    leadConversionRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch contacts and companies in parallel
      const [contactsResponse, companiesResponse] = await Promise.all([
        api.get('/contacts?limit=1000'),
        api.get('/companies'),
      ]);

      const contacts = contactsResponse.data.contacts || [];
      const companies = companiesResponse.data.companies || [];

      // Calculate recent contacts (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentContacts = contacts.filter((contact: any) => 
        new Date(contact.created_at) > thirtyDaysAgo
      ).length;

      // Calculate lead conversion rate
      const qualifiedLeads = contacts.filter((contact: any) => 
        contact.lead_status === 'qualified' || contact.lead_status === 'customer'
      ).length;
      
      const conversionRate = contacts.length > 0 
        ? Math.round((qualifiedLeads / contacts.length) * 100) 
        : 0;

      setStats({
        totalContacts: contacts.length,
        totalCompanies: companies.length,
        recentContacts,
        leadConversionRate: conversionRate,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard: React.FC<{
    title: string;
    value: number | string;
    icon: React.ReactNode;
    color: string;
    suffix?: string;
  }> = ({ title, value, icon, color, suffix = '' }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="h6">
              {title}
            </Typography>
            <Typography variant="h4" component="h2" sx={{ color }}>
              {value}{suffix}
            </Typography>
          </Box>
          <Box sx={{ color, opacity: 0.7 }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Loading Dashboard...
        </Typography>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome back, {user?.first_name || user?.email}! Here's what's happening with your CRM.
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/contacts/new')}
          >
            New Contact
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate('/import')}
          >
            Import Data
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Contacts"
            value={stats.totalContacts}
            icon={<People fontSize="large" />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Companies"
            value={stats.totalCompanies}
            icon={<Business fontSize="large" />}
            color="#388e3c"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="New This Month"
            value={stats.recentContacts}
            icon={<Add fontSize="large" />}
            color="#f57c00"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Conversion Rate"
            value={stats.leadConversionRate}
            icon={<TrendingUp fontSize="large" />}
            color="#7b1fa2"
            suffix="%"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                <Button
                  variant="outlined"
                  startIcon={<People />}
                  onClick={() => navigate('/contacts/new')}
                  fullWidth
                >
                  Add New Contact
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Business />}
                  onClick={() => navigate('/companies/new')}
                  fullWidth
                >
                  Add New Company
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Overview
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Your CRM system is running smoothly. You have {stats.totalContacts} contacts 
                and {stats.totalCompanies} companies in your database.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {stats.recentContacts} new contacts were added this month, 
                with a {stats.leadConversionRate}% lead conversion rate.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;