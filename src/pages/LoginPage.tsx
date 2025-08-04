import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Fade,
  Slide,
  useTheme,
  useMediaQuery,
  IconButton,
  Avatar,
  Stack,
  Divider,
} from '@mui/material';
import {
  LockOutlined,
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  AutoAwesome,
  TrendingUp,
  Security,
  Speed,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: <AutoAwesome />, text: 'AI-Powered Insights' },
    { icon: <TrendingUp />, text: 'Advanced Analytics' },
    { icon: <Security />, text: 'Enterprise Security' },
    { icon: <Speed />, text: 'Lightning Fast' },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(255,255,255,0.08) 0%, transparent 50%)',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: '10%',
          right: '10%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'pulse 6s ease-in-out infinite',
        },
        '@keyframes pulse': {
          '0%, 100%': { transform: 'scale(1)', opacity: 0.3 },
          '50%': { transform: 'scale(1.1)', opacity: 0.5 },
        },
      }}
    >
      <Container 
        component="main" 
        maxWidth="lg"
        sx={{
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', minHeight: '100vh', py: 4 }}>
          {/* Left Side - Branding */}
          <Slide direction="right" in={true} timeout={800}>
            <Box 
              sx={{ 
                flex: 1, 
                pr: { md: 6 },
                display: { xs: 'none', md: 'block' },
                color: 'white',
              }}
            >
              <Box sx={{ mb: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                  <Avatar
                    sx={{
                      width: 64,
                      height: 64,
                      background: 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(10px)',
                      mr: 3,
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                    }}
                  >
                    <AutoAwesome sx={{ fontSize: 32, color: 'white' }} />
                  </Avatar>
                  <Box>
                    <Typography 
                      variant="h3" 
                      sx={{ 
                        fontWeight: 800,
                        letterSpacing: '-0.02em',
                        mb: 1,
                      }}
                    >
                      CRM Pro
                    </Typography>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        opacity: 0.9,
                        fontWeight: 500,
                      }}
                    >
                      Enterprise Customer Relationship Management
                    </Typography>
                  </Box>
                </Box>
                
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 700,
                    mb: 3,
                    lineHeight: 1.2,
                  }}
                >
                  Transform Your Business Relationships
                </Typography>
                
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontSize: '1.125rem',
                    opacity: 0.9,
                    mb: 4,
                    lineHeight: 1.6,
                  }}
                >
                  Leverage advanced analytics, AI-powered insights, and enterprise-grade security 
                  to manage your customer relationships like never before.
                </Typography>

                <Stack spacing={2}>
                  {features.map((feature, index) => (
                    <Fade in={true} timeout={1000 + index * 200} key={index}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar
                          sx={{
                            width: 40,
                            height: 40,
                            background: 'rgba(255, 255, 255, 0.15)',
                            backdropFilter: 'blur(10px)',
                            mr: 2,
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                          }}
                        >
                          {React.cloneElement(feature.icon, { sx: { fontSize: 20, color: 'white' } })}
                        </Avatar>
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            fontWeight: 600,
                            fontSize: '1rem',
                          }}
                        >
                          {feature.text}
                        </Typography>
                      </Box>
                    </Fade>
                  ))}
                </Stack>
              </Box>
            </Box>
          </Slide>

          {/* Right Side - Login Form */}
          <Slide direction="left" in={true} timeout={800}>
            <Box sx={{ flex: { xs: 1, md: 0.6 }, maxWidth: 480 }}>
              <Fade in={true} timeout={1200}>
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 4, sm: 5, md: 6 },
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.98)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: 6,
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: 'linear-gradient(90deg, #2563eb 0%, #7c3aed 100%)',
                    },
                  }}
                >
                  {/* Header */}
                  <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Avatar
                      sx={{
                        width: 72,
                        height: 72,
                        background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                        margin: '0 auto 24px',
                        boxShadow: '0 10px 30px rgba(37, 99, 235, 0.3)',
                      }}
                    >
                      <LockOutlined sx={{ fontSize: 36 }} />
                    </Avatar>
                    <Typography
                      component="h1"
                      variant="h4"
                      sx={{
                        fontWeight: 800,
                        background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        mb: 1,
                        letterSpacing: '-0.02em',
                      }}
                    >
                      Welcome Back
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: '#64748b',
                        fontSize: '1.1rem',
                        fontWeight: 500,
                      }}
                    >
                      Sign in to access your CRM dashboard
                    </Typography>
                  </Box>

                  {/* Error Alert */}
                  {error && (
                    <Slide direction="down" in={true} timeout={300}>
                      <Alert
                        severity="error"
                        sx={{
                          mb: 3,
                          borderRadius: 3,
                          background: 'rgba(220, 38, 38, 0.1)',
                          border: '1px solid rgba(220, 38, 38, 0.2)',
                          '& .MuiAlert-icon': {
                            color: '#dc2626',
                          },
                        }}
                      >
                        {error}
                      </Alert>
                    </Slide>
                  )}

                  {/* Login Form */}
                  <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      id="email"
                      label="Email Address"
                      name="email"
                      autoComplete="email"
                      autoFocus
                      value={formData.email}
                      onChange={handleChange}
                      disabled={loading}
                      InputProps={{
                        startAdornment: (
                          <Email sx={{ mr: 2, color: '#64748b' }} />
                        ),
                      }}
                      sx={{ mb: 3 }}
                    />
                    
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      name="password"
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      autoComplete="current-password"
                      value={formData.password}
                      onChange={handleChange}
                      disabled={loading}
                      InputProps={{
                        startAdornment: (
                          <Lock sx={{ mr: 2, color: '#64748b' }} />
                        ),
                        endAdornment: (
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            sx={{ color: '#64748b' }}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        ),
                      }}
                      sx={{ mb: 4 }}
                    />
                    
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      disabled={loading}
                      sx={{
                        py: 2,
                        mb: 3,
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                        boxShadow: '0 8px 25px rgba(37, 99, 235, 0.3)',
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        textTransform: 'none',
                        letterSpacing: '0.01em',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #1d4ed8 0%, #6d28d9 100%)',
                          boxShadow: '0 12px 35px rgba(37, 99, 235, 0.4)',
                          transform: 'translateY(-2px)',
                        },
                        '&:disabled': {
                          background: 'linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%)',
                          boxShadow: 'none',
                          transform: 'none',
                        },
                      }}
                    >
                      {loading ? (
                        <CircularProgress size={24} sx={{ color: 'white' }} />
                      ) : (
                        'Sign In to Dashboard'
                      )}
                    </Button>

                    <Divider sx={{ my: 3 }}>
                      <Typography variant="body2" sx={{ color: '#94a3b8', fontWeight: 500 }}>
                        Secure Enterprise Access
                      </Typography>
                    </Divider>

                    {/* Features */}
                    <Stack direction="row" spacing={2} justifyContent="center">
                      <Box sx={{ textAlign: 'center' }}>
                        <Avatar sx={{ width: 32, height: 32, background: 'rgba(37, 99, 235, 0.1)', mx: 'auto', mb: 1 }}>
                          <Security sx={{ fontSize: 16, color: '#2563eb' }} />
                        </Avatar>
                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                          Secure
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center' }}>
                        <Avatar sx={{ width: 32, height: 32, background: 'rgba(37, 99, 235, 0.1)', mx: 'auto', mb: 1 }}>
                          <Speed sx={{ fontSize: 16, color: '#2563eb' }} />
                        </Avatar>
                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                          Fast
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center' }}>
                        <Avatar sx={{ width: 32, height: 32, background: 'rgba(37, 99, 235, 0.1)', mx: 'auto', mb: 1 }}>
                          <AutoAwesome sx={{ fontSize: 16, color: '#2563eb' }} />
                        </Avatar>
                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                          Smart
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                </Paper>
              </Fade>
            </Box>
          </Slide>
        </Box>
      </Container>
    </Box>
  );
};

export default LoginPage;