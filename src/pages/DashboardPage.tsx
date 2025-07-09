import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  useTheme,
  useMediaQuery,
  Fade,
  Slide,
  Grow,
  Chip,
  Avatar,
  Divider,
} from '@mui/material';
import {
  People,
  Business,
  TrendingUp,
  Add,
  ArrowForward,
  Speed,
  CheckCircle,
  Warning,
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
      // Fetch dashboard stats from backend
      const statsResponse = await api.get('/contacts/dashboard-stats');
      const statsData = statsResponse.data;
      setStats({
        totalContacts: statsData.total_contacts,
        totalCompanies: statsData.total_companies,
        recentContacts: statsData.recent_contacts,
        leadConversionRate: statsData.lead_conversion_rate,
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
    index: number;
  }> = ({ title, value, icon, color, suffix = '', index }) => (
    <Slide direction="up" in={true} timeout={300 + index * 200}>
      <Card
        sx={{
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          background: 'rgba(255, 255, 255, 0.85)',
          borderRadius: 4,
          padding: 3,
          boxShadow: '0 12px 24px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(255,255,255,0.2)',
          height: '100%',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: '0 24px 48px rgba(0, 0, 0, 0.15)',
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: `linear-gradient(90deg, ${color} 0%, ${color}88 100%)`,
          },
        }}
      >
        <CardContent sx={{ p: 0 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box sx={{ flex: 1 }}>
              <Typography
                sx={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#64748b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  mb: 1,
                }}
              >
                {title}
              </Typography>
              <Typography
                sx={{
                  fontSize: '2.5rem',
                  fontWeight: 800,
                  color: '#1e293b',
                  letterSpacing: '-1px',
                  lineHeight: 1,
                }}
              >
                {value}{suffix}
              </Typography>
            </Box>
            <Box
              sx={{
                backgroundColor: `${color}15`,
                borderRadius: '50%',
                padding: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: color,
                fontSize: '2rem',
                boxShadow: `0 8px 24px ${color}30`,
                border: `1px solid ${color}20`,
              }}
            >
              {icon}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Slide>
  );

  if (loading) {
    return (
      <Box sx={{ p: 4 }}>
        <Fade in={true} timeout={500}>
          <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
              Loading Dashboard...
            </Typography>
            <LinearProgress 
              sx={{ 
                height: 8, 
                borderRadius: 4,
                background: 'rgba(99, 102, 241, 0.1)',
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(90deg, #6366f1 0%, #4f46e5 100%)',
                }
              }} 
            />
          </Box>
        </Fade>
      </Box>
    );
  }

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
              Dashboard
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#64748b',
                fontWeight: 500,
                mb: 1,
              }}
            >
              Welcome back, {user?.first_name || user?.email}! 
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: '#94a3b8',
                fontSize: '0.95rem',
              }}
            >
              Here's what's happening with your CRM system today.
            </Typography>
          </Box>
          <Box display="flex" gap={2} flexWrap="wrap">
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
              New Contact
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/import')}
              sx={{
                borderWidth: '2px',
                '&:hover': {
                  borderWidth: '2px',
                  background: 'rgba(99, 102, 241, 0.04)',
                },
              }}
            >
              Import Data
            </Button>
          </Box>
        </Box>
      </Fade>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Contacts"
            value={stats.totalContacts}
            icon={<People fontSize="inherit" />}
            color="#6366f1"
            index={0}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Companies"
            value={stats.totalCompanies}
            icon={<Business fontSize="inherit" />}
            color="#10b981"
            index={1}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="New This Month"
            value={stats.recentContacts}
            icon={<Add fontSize="inherit" />}
            color="#f59e0b"
            index={2}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Conversion Rate"
            value={stats.leadConversionRate}
            icon={<TrendingUp fontSize="inherit" />}
            color="#ef4444"
            suffix="%"
            index={3}
          />
        </Grid>
      </Grid>

      {/* Bottom Section */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Grow in={true} timeout={1000}>
            <Card
              sx={{
                backdropFilter: 'blur(16px)',
                background: 'rgba(255, 255, 255, 0.85)',
                borderRadius: 4,
                boxShadow: '0 12px 24px rgba(0, 0, 0, 0.08)',
                border: '1px solid rgba(255,255,255,0.2)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                height: '100%',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.12)',
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar
                    sx={{
                      background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                      mr: 2,
                    }}
                  >
                    <Speed />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Quick Actions
                  </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />
                <Box display="flex" flexDirection="column" gap={2}>
                  <Button
                    variant="outlined"
                    startIcon={<People />}
                    endIcon={<ArrowForward />}
                    onClick={() => navigate('/contacts/new')}
                    fullWidth
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      borderWidth: '2px',
                      '&:hover': {
                        borderWidth: '2px',
                        background: 'rgba(99, 102, 241, 0.04)',
                        transform: 'translateX(4px)',
                      },
                    }}
                  >
                    Add New Contact
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Business />}
                    endIcon={<ArrowForward />}
                    onClick={() => navigate('/companies/new')}
                    fullWidth
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      borderWidth: '2px',
                      '&:hover': {
                        borderWidth: '2px',
                        background: 'rgba(99, 102, 241, 0.04)',
                        transform: 'translateX(4px)',
                      },
                    }}
                  >
                    Add New Company
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grow>
        </Grid>

        <Grid item xs={12} md={6}>
          <Grow in={true} timeout={1200}>
            <Card
              sx={{
                backdropFilter: 'blur(16px)',
                background: 'rgba(255, 255, 255, 0.85)',
                borderRadius: 4,
                boxShadow: '0 12px 24px rgba(0, 0, 0, 0.08)',
                border: '1px solid rgba(255,255,255,0.2)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                height: '100%',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.12)',
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar
                    sx={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      mr: 2,
                    }}
                  >
                    <CheckCircle />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    System Overview
                  </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />
                <Box>
                  <Typography
                    variant="body1"
                    sx={{ 
                      color: '#475569',
                      mb: 2,
                      lineHeight: 1.6,
                    }}
                  >
                    Your CRM system is running smoothly. You have{' '}
                    <Chip 
                      label={stats.totalContacts} 
                      size="small" 
                      color="primary"
                      sx={{ fontWeight: 600 }}
                    />{' '}
                    contacts and{' '}
                    <Chip 
                      label={stats.totalCompanies} 
                      size="small" 
                      color="success"
                      sx={{ fontWeight: 600 }}
                    />{' '}
                    companies in your database.
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#64748b',
                      lineHeight: 1.6,
                    }}
                  >
                    <Chip 
                      label={stats.recentContacts} 
                      size="small" 
                      color="warning"
                      sx={{ fontWeight: 600, mr: 1 }}
                    />
                    new contacts were added this month, with a{' '}
                    <Chip 
                      label={`${stats.leadConversionRate}%`} 
                      size="small" 
                      color="error"
                      sx={{ fontWeight: 600 }}
                    />{' '}
                    lead conversion rate.
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grow>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
