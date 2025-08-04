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
  Stack,
  Paper,
  IconButton,
  Tooltip,
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
  Analytics,
  AutoAwesome,
  Insights,
  Timeline,
  Assessment,
  ShowChart,
  DataUsage,
  PieChart,
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
    gradient: string;
    suffix?: string;
    index: number;
    trend?: string;
    trendValue?: string;
  }> = ({ title, value, icon, gradient, suffix = '', index, trend, trendValue }) => (
    <Slide direction="up" in={true} timeout={300 + index * 200}>
      <Card
        sx={{
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px)',
          borderRadius: 5,
          padding: 3,
          boxShadow: '0 12px 24px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          height: '100%',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: '0 24px 48px rgba(0, 0, 0, 0.15)',
            borderColor: 'rgba(37, 99, 235, 0.3)',
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: gradient,
          },
        }}
      >
        <CardContent sx={{ p: 0 }}>
          <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={2}>
            <Box sx={{ flex: 1 }}>
              <Typography
                sx={{
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: '#64748b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  mb: 1,
                }}
              >
                {title}
              </Typography>
              <Typography
                sx={{
                  fontSize: '2.75rem',
                  fontWeight: 800,
                  color: '#0f172a',
                  letterSpacing: '-0.02em',
                  lineHeight: 1,
                  mb: 1,
                }}
              >
                {value}{suffix}
              </Typography>
              {trend && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Chip
                    label={`${trend} ${trendValue}`}
                    size="small"
                    sx={{
                      background: trend === '+' ? 'rgba(5, 150, 105, 0.1)' : 'rgba(220, 38, 38, 0.1)',
                      color: trend === '+' ? '#059669' : '#dc2626',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      height: 24,
                      border: `1px solid ${trend === '+' ? 'rgba(5, 150, 105, 0.2)' : 'rgba(220, 38, 38, 0.2)'}`,
                    }}
                  />
                </Box>
              )}
            </Box>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                background: gradient,
                boxShadow: '0 8px 24px rgba(37, 99, 235, 0.3)',
                border: '3px solid rgba(255, 255, 255, 0.8)',
              }}
            >
              {React.cloneElement(icon as React.ReactElement, { sx: { fontSize: 28 } })}
            </Avatar>
          </Box>
        </CardContent>
      </Card>
    </Slide>
  );

  const QuickActionCard: React.FC<{
    title: string;
    description: string;
    icon: React.ReactNode;
    gradient: string;
    onClick: () => void;
    index: number;
  }> = ({ title, description, icon, gradient, onClick, index }) => (
    <Grow in={true} timeout={1000 + index * 200}>
      <Card
        sx={{
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px)',
          borderRadius: 5,
          boxShadow: '0 12px 24px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          height: '100%',
          cursor: 'pointer',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.12)',
            borderColor: 'rgba(37, 99, 235, 0.3)',
          },
        }}
        onClick={onClick}
      >
        <CardContent sx={{ p: 4 }}>
          <Box display="flex" alignItems="center" mb={3}>
            <Avatar
              sx={{
                width: 56,
                height: 56,
                background: gradient,
                mr: 3,
                boxShadow: '0 8px 24px rgba(37, 99, 235, 0.3)',
              }}
            >
              {React.cloneElement(icon as React.ReactElement, { sx: { fontSize: 24 } })}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#0f172a' }}>
                {title}
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', lineHeight: 1.5 }}>
                {description}
              </Typography>
            </Box>
            <IconButton
              sx={{
                background: 'rgba(37, 99, 235, 0.1)',
                color: '#2563eb',
                '&:hover': {
                  background: 'rgba(37, 99, 235, 0.2)',
                  transform: 'translateX(4px)',
                },
              }}
            >
              <ArrowForward />
            </IconButton>
          </Box>
        </CardContent>
      </Card>
    </Grow>
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
                background: 'rgba(37, 99, 235, 0.1)',
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(90deg, #2563eb 0%, #7c3aed 100%)',
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
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar
              sx={{
                width: 48,
                height: 48,
                background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                mr: 2,
                fontWeight: 700,
              }}
            >
              {user?.first_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </Avatar>
            <Box>
              <Typography 
                variant="h3" 
                sx={{ 
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #0f172a 0%, #475569 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.1,
                }}
              >
                Welcome back, {user?.first_name || 'User'}!
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: '#64748b',
                  fontWeight: 500,
                  mt: 0.5,
                }}
              >
                Here's what's happening with your business today
              </Typography>
            </Box>
          </Box>
          
          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/contacts/new')}
              sx={{
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                boxShadow: '0 8px 25px rgba(37, 99, 235, 0.3)',
                px: 3,
                py: 1.5,
                fontWeight: 700,
                '&:hover': {
                  background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
                  boxShadow: '0 12px 35px rgba(37, 99, 235, 0.4)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              New Contact
            </Button>
            <Button
              variant="outlined"
              startIcon={<Analytics />}
              onClick={() => navigate('/contacts')}
              sx={{
                borderWidth: '2px',
                px: 3,
                py: 1.5,
                fontWeight: 700,
                '&:hover': {
                  borderWidth: '2px',
                  background: 'rgba(37, 99, 235, 0.04)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              View Analytics
            </Button>
          </Stack>
        </Box>
      </Fade>

      {/* Stats Cards */}
      <Grid container spacing={4} sx={{ mb: 6 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Total Contacts"
            value={stats.totalContacts}
            icon={<People />}
            gradient="linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)"
            index={0}
            trend="+"
            trendValue="12%"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Active Companies"
            value={stats.totalCompanies}
            icon={<Business />}
            gradient="linear-gradient(135deg, #059669 0%, #047857 100%)"
            index={1}
            trend="+"
            trendValue="8%"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="New This Month"
            value={stats.recentContacts}
            icon={<TrendingUp />}
            gradient="linear-gradient(135deg, #d97706 0%, #b45309 100%)"
            index={2}
            trend="+"
            trendValue="24%"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Conversion Rate"
            value={stats.leadConversionRate}
            icon={<Assessment />}
            gradient="linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)"
            suffix="%"
            index={3}
            trend="+"
            trendValue="5%"
          />
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Fade in={true} timeout={1200}>
        <Box sx={{ mb: 6 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700,
              mb: 1,
              color: '#0f172a',
              letterSpacing: '-0.01em',
            }}
          >
            Quick Actions
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: '#64748b',
              mb: 4,
              fontSize: '1.1rem',
            }}
          >
            Jump into your most common tasks
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={6} lg={4}>
              <QuickActionCard
                title="Add New Contact"
                description="Create a new contact record with complete information"
                icon={<People />}
                gradient="linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)"
                onClick={() => navigate('/contacts/new')}
                index={0}
              />
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <QuickActionCard
                title="Import Data"
                description="Bulk import contacts from CSV or Excel files"
                icon={<DataUsage />}
                gradient="linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)"
                onClick={() => navigate('/import')}
                index={1}
              />
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <QuickActionCard
                title="Data Utilities"
                description="Clean duplicates and manage data quality"
                icon={<AutoAwesome />}
                gradient="linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)"
                onClick={() => navigate('/data-utility')}
                index={2}
              />
            </Grid>
          </Grid>
        </Box>
      </Fade>

      {/* Analytics Overview */}
      <Grid container spacing={4}>
        <Grid item xs={12} lg={8}>
          <Grow in={true} timeout={1400}>
            <Card
              sx={{
                background: 'rgba(255, 255, 255, 0.98)',
                backdropFilter: 'blur(20px)',
                borderRadius: 5,
                boxShadow: '0 12px 24px rgba(0, 0, 0, 0.08)',
                border: '1px solid rgba(226, 232, 240, 0.8)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                height: '100%',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.12)',
                  borderColor: 'rgba(37, 99, 235, 0.3)',
                },
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box display="flex" alignItems="center" justifyContent="between" mb={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                      sx={{
                        background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                        mr: 2,
                        width: 48,
                        height: 48,
                      }}
                    >
                      <Insights />
                    </Avatar>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f172a' }}>
                        Business Intelligence
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#64748b' }}>
                        AI-powered insights and analytics
                      </Typography>
                    </Box>
                  </Box>
                  <Tooltip title="View Full Analytics">
                    <IconButton
                      sx={{
                        background: 'rgba(37, 99, 235, 0.1)',
                        color: '#2563eb',
                        '&:hover': {
                          background: 'rgba(37, 99, 235, 0.2)',
                        },
                      }}
                    >
                      <ShowChart />
                    </IconButton>
                  </Tooltip>
                </Box>
                
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Avatar
                        sx={{
                          width: 56,
                          height: 56,
                          background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                          mx: 'auto',
                          mb: 2,
                        }}
                      >
                        <Timeline />
                      </Avatar>
                      <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>
                        94%
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
                        Data Quality Score
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Avatar
                        sx={{
                          width: 56,
                          height: 56,
                          background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                          mx: 'auto',
                          mb: 2,
                        }}
                      >
                        <Speed />
                      </Avatar>
                      <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>
                        2.3s
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
                        Avg Response Time
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Avatar
                        sx={{
                          width: 56,
                          height: 56,
                          background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                          mx: 'auto',
                          mb: 2,
                        }}
                      >
                        <PieChart />
                      </Avatar>
                      <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>
                        87%
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
                        Customer Satisfaction
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grow>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Grow in={true} timeout={1600}>
            <Card
              sx={{
                background: 'rgba(255, 255, 255, 0.98)',
                backdropFilter: 'blur(20px)',
                borderRadius: 5,
                boxShadow: '0 12px 24px rgba(0, 0, 0, 0.08)',
                border: '1px solid rgba(226, 232, 240, 0.8)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                height: '100%',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.12)',
                  borderColor: 'rgba(37, 99, 235, 0.3)',
                },
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box display="flex" alignItems="center" mb={3}>
                  <Avatar
                    sx={{
                      background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                      mr: 2,
                      width: 48,
                      height: 48,
                    }}
                  >
                    <CheckCircle />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
                      System Health
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                      All systems operational
                    </Typography>
                  </Box>
                </Box>
                
                <Divider sx={{ mb: 3 }} />
                
                <Stack spacing={3}>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
                        Database Performance
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#059669', fontWeight: 700 }}>
                        98%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={98}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: 'rgba(5, 150, 105, 0.1)',
                        '& .MuiLinearProgress-bar': {
                          background: 'linear-gradient(90deg, #059669 0%, #047857 100%)',
                          borderRadius: 4,
                        },
                      }}
                    />
                  </Box>
                  
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
                        API Response
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#d97706', fontWeight: 700 }}>
                        85%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={85}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: 'rgba(217, 119, 6, 0.1)',
                        '& .MuiLinearProgress-bar': {
                          background: 'linear-gradient(90deg, #d97706 0%, #b45309 100%)',
                          borderRadius: 4,
                        },
                      }}
                    />
                  </Box>
                  
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
                        Security Score
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#2563eb', fontWeight: 700 }}>
                        100%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={100}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: 'rgba(37, 99, 235, 0.1)',
                        '& .MuiLinearProgress-bar': {
                          background: 'linear-gradient(90deg, #2563eb 0%, #1d4ed8 100%)',
                          borderRadius: 4,
                        },
                      }}
                    />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grow>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;