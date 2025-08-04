import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  Badge,
  Tooltip,
  Fade,
  Slide,
  Button,
  Chip,
  Stack,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  People,
  Business,
  Upload,
  Download,
  AccountCircle,
  Logout,
  Notifications,
  Settings,
  Build,
  Search,
  Add,
  TrendingUp,
  Analytics,
  Speed,
  AutoAwesome,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const drawerWidth = 320;

const Layout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseProfileMenu = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleCloseProfileMenu();
  };

  const menuItems = [
    { 
      text: 'Dashboard', 
      icon: <Dashboard />, 
      path: '/dashboard',
      badge: null,
      gradient: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
    },
    { 
      text: 'Contacts', 
      icon: <People />, 
      path: '/contacts',
      badge: null,
      gradient: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)',
    },
    { 
      text: 'Companies', 
      icon: <Business />, 
      path: '/companies',
      badge: null,
      gradient: 'linear-gradient(135deg, #d97706 0%, #ea580c 100%)',
    },
    { 
      text: 'Import Data', 
      icon: <Download />, 
      path: '/import',
      badge: null,
      gradient: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
    },
    {
      text: 'Data Utility',
      icon: <Build />,
      path: '/data-utility',
      badge: null,
      gradient: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
    },
    {
      text: 'Export Data',
      icon: <Upload />,
      path: '/export',
      badge: null,
      gradient: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)',
    },
  ];

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo Section */}
      <Box
        sx={{
          p: 4,
          background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.2) 0%, transparent 50%)',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: -50,
            right: -50,
            width: 100,
            height: 100,
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            borderRadius: '50%',
          },
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar
              sx={{
                width: 48,
                height: 48,
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                mr: 2,
                border: '2px solid rgba(255, 255, 255, 0.3)',
              }}
            >
              <AutoAwesome sx={{ color: 'white' }} />
            </Avatar>
            <Box>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2,
                }}
              >
                CRM Pro
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  opacity: 0.9,
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                Enterprise Suite
              </Typography>
            </Box>
          </Box>
          <Chip
            label="Premium"
            size="small"
            sx={{
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              fontWeight: 700,
              fontSize: '0.7rem',
              height: 24,
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
            }}
          />
        </Box>
      </Box>

      {/* Quick Actions */}
      <Box sx={{ p: 3, borderBottom: '1px solid rgba(226, 232, 240, 0.5)' }}>
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            startIcon={<Add />}
            onClick={() => navigate('/contacts/new')}
            sx={{
              flex: 1,
              background: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.75rem',
              py: 1,
              borderRadius: 2,
              '&:hover': {
                background: 'linear-gradient(135deg, #047857 0%, #0f766e 100%)',
                transform: 'translateY(-1px)',
              },
            }}
          >
            Contact
          </Button>
          <Button
            size="small"
            startIcon={<Search />}
            onClick={() => navigate('/contacts')}
            sx={{
              flex: 1,
              background: 'rgba(37, 99, 235, 0.1)',
              color: '#2563eb',
              fontWeight: 600,
              fontSize: '0.75rem',
              py: 1,
              borderRadius: 2,
              border: '1px solid rgba(37, 99, 235, 0.2)',
              '&:hover': {
                background: 'rgba(37, 99, 235, 0.15)',
                transform: 'translateY(-1px)',
              },
            }}
          >
            Search
          </Button>
        </Stack>
      </Box>

      {/* Navigation Menu */}
      <Box sx={{ flex: 1, p: 3 }}>
        <Typography
          variant="overline"
          sx={{
            color: '#64748b',
            fontWeight: 700,
            fontSize: '0.7rem',
            letterSpacing: '0.1em',
            mb: 2,
            display: 'block',
          }}
        >
          Main Navigation
        </Typography>
        <List sx={{ p: 0 }}>
          {menuItems.map((item, index) => (
            <Slide direction="right" in={true} timeout={300 + index * 100} key={item.text}>
              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  selected={location.pathname === item.path}
                  onClick={() => {
                    navigate(item.path);
                    if (isMobile) {
                      setMobileOpen(false);
                    }
                  }}
                  sx={{
                    borderRadius: 3,
                    mx: 0,
                    py: 1.5,
                    px: 2,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      background: 'rgba(37, 99, 235, 0.08)',
                      transform: 'translateX(4px)',
                      '&::before': {
                        opacity: 1,
                        transform: 'translateX(0)',
                      },
                    },
                    '&.Mui-selected': {
                      background: item.gradient,
                      color: 'white',
                      boxShadow: '0 8px 25px rgba(37, 99, 235, 0.3)',
                      '&:hover': {
                        background: item.gradient,
                        transform: 'translateX(4px) translateY(-1px)',
                      },
                      '& .MuiListItemIcon-root': {
                        color: 'white',
                      },
                      '& .MuiListItemText-primary': {
                        fontWeight: 700,
                      },
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: 4,
                      background: item.gradient,
                      opacity: location.pathname === item.path ? 1 : 0,
                      transform: location.pathname === item.path ? 'translateX(0)' : 'translateX(-100%)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: location.pathname === item.path ? 'white' : '#64748b',
                      minWidth: 40,
                      transition: 'color 0.3s ease',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text}
                    sx={{
                      '& .MuiTypography-root': {
                        fontWeight: location.pathname === item.path ? 700 : 600,
                        fontSize: '0.9rem',
                        letterSpacing: '0.01em',
                      },
                    }}
                  />
                  {item.badge && (
                    <Badge badgeContent={item.badge} color="error" />
                  )}
                </ListItemButton>
              </ListItem>
            </Slide>
          ))}
        </List>
      </Box>

      {/* User Profile Section */}
      <Box sx={{ p: 3, borderTop: '1px solid rgba(226, 232, 240, 0.5)' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            p: 2,
            borderRadius: 3,
            background: 'rgba(248, 250, 252, 0.8)',
            border: '1px solid rgba(226, 232, 240, 0.5)',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease',
            '&:hover': {
              background: 'rgba(37, 99, 235, 0.05)',
              borderColor: 'rgba(37, 99, 235, 0.2)',
              transform: 'translateY(-1px)',
            },
          }}
        >
          <Avatar
            sx={{
              width: 44,
              height: 44,
              background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
              mr: 2,
              fontWeight: 700,
              fontSize: '1rem',
            }}
          >
            {user?.first_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 700,
                color: '#0f172a',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontSize: '0.875rem',
              }}
            >
              {user?.first_name || 'User'}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: '#64748b',
                fontSize: '0.75rem',
                fontWeight: 500,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                display: 'block',
              }}
            >
              {user?.email}
            </Typography>
          </Box>
          <Chip
            label="Pro"
            size="small"
            sx={{
              background: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)',
              color: 'white',
              fontWeight: 700,
              fontSize: '0.65rem',
              height: 20,
            }}
          />
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          zIndex: theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ 
                mr: 2, 
                display: { md: 'none' },
                color: '#0f172a',
                background: 'rgba(248, 250, 252, 0.8)',
                '&:hover': {
                  background: 'rgba(37, 99, 235, 0.1)',
                },
              }}
            >
              <MenuIcon />
            </IconButton>
            <Box>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 700,
                  color: '#0f172a',
                  fontSize: '1.25rem',
                  letterSpacing: '-0.01em',
                }}
              >
                {menuItems.find(item => item.path === location.pathname)?.text || 'Dashboard'}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: '#64748b',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  display: { xs: 'none', sm: 'block' },
                }}
              >
                Manage your business relationships
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Analytics">
              <IconButton
                size="large"
                sx={{ 
                  color: '#64748b',
                  background: 'rgba(248, 250, 252, 0.8)',
                  '&:hover': {
                    background: 'rgba(37, 99, 235, 0.1)',
                    color: '#2563eb',
                  },
                }}
              >
                <Analytics />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Performance">
              <IconButton
                size="large"
                sx={{ 
                  color: '#64748b',
                  background: 'rgba(248, 250, 252, 0.8)',
                  '&:hover': {
                    background: 'rgba(37, 99, 235, 0.1)',
                    color: '#2563eb',
                  },
                }}
              >
                <Speed />
              </IconButton>
            </Tooltip>

            <Tooltip title="Notifications">
              <IconButton
                size="large"
                sx={{ 
                  color: '#64748b',
                  background: 'rgba(248, 250, 252, 0.8)',
                  '&:hover': {
                    background: 'rgba(37, 99, 235, 0.1)',
                    color: '#2563eb',
                  },
                }}
              >
                <Badge badgeContent={3} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Settings">
              <IconButton
                size="large"
                sx={{ 
                  color: '#64748b',
                  background: 'rgba(248, 250, 252, 0.8)',
                  '&:hover': {
                    background: 'rgba(37, 99, 235, 0.1)',
                    color: '#2563eb',
                  },
                }}
              >
                <Settings />
              </IconButton>
            </Tooltip>

            <Tooltip title="Profile">
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="profile-menu"
                aria-haspopup="true"
                onClick={handleProfileMenu}
                sx={{ 
                  color: '#0f172a',
                  ml: 1,
                }}
              >
                <Avatar 
                  sx={{ 
                    width: 40, 
                    height: 40,
                    background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                    fontWeight: 700,
                    border: '2px solid rgba(37, 99, 235, 0.2)',
                  }}
                >
                  {user?.first_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Profile Menu */}
      <Menu
        id="profile-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseProfileMenu}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            backdropFilter: 'blur(20px)',
            background: 'rgba(255, 255, 255, 0.98)',
            minWidth: 220,
            mt: 1,
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid rgba(226, 232, 240, 0.5)' }}>
          <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
            {user?.first_name || 'User'}
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b' }}>
            {user?.email}
          </Typography>
        </Box>
        <MenuItem 
          onClick={handleLogout}
          sx={{
            borderRadius: 2,
            mx: 1,
            my: 1,
            color: '#dc2626',
            fontWeight: 600,
            '&:hover': {
              background: 'rgba(220, 38, 38, 0.08)',
            },
          }}
        >
          <ListItemIcon>
            <Logout fontSize="small" sx={{ color: '#dc2626' }} />
          </ListItemIcon>
          <Typography sx={{ fontWeight: 600 }}>
            Sign Out
          </Typography>
        </MenuItem>
      </Menu>

      {/* Navigation Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              border: 'none',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              border: 'none',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3, md: 4 },
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 20% 80%, rgba(37, 99, 235, 0.03) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(124, 58, 237, 0.03) 0%, transparent 50%)',
            pointerEvents: 'none',
          },
        }}
      >
        <Box sx={{ pt: { xs: 8, md: 9 }, position: 'relative', zIndex: 1 }}>
          <Fade in={true} timeout={500}>
            <Box>
              <Outlet />
            </Box>
          </Fade>
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;