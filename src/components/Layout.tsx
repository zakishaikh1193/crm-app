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
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  People,
  Business,
  Upload,
  AccountCircle,
  Logout,
  Notifications,
  Settings,
  Build,
  Email,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const drawerWidth = 280;

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
      badge: null
    },
    { 
      text: 'Contacts', 
      icon: <People />, 
      path: '/contacts',
      badge: null
    },
    { 
      text: 'Companies', 
      icon: <Business />, 
      path: '/companies',
      badge: null
    },
    { 
      text: 'Import Data', 
      icon: <Upload />, 
      path: '/import',
      badge: null
    },
    {
      text: 'Data Utility',
      icon: <Build />,
      path: '/data-utility',
      badge: null
    },
    {
      text: 'Missing Emails',
      icon: <Email />, // Email icon for missing emails
      path: '/missing-emails',
      badge: null
    },
  ];

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo Section */}
      <Box
        sx={{
          p: 3,
          background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
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
            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            opacity: 0.3,
          },
        }}
      >
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 800,
            letterSpacing: '-0.025em',
            position: 'relative',
            zIndex: 1,
          }}
        >
          CRM System
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            opacity: 0.9,
            mt: 0.5,
            position: 'relative',
            zIndex: 1,
          }}
        >
          Customer Relationship Management
        </Typography>
      </Box>

      {/* Navigation Menu */}
      <Box sx={{ flex: 1, p: 2 }}>
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
                    mx: 1,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      background: 'rgba(99, 102, 241, 0.08)',
                      transform: 'translateX(4px)',
                    },
                    '&.Mui-selected': {
                      background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(79, 70, 229, 0.12) 100%)',
                      border: '1px solid rgba(99, 102, 241, 0.2)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.16) 0%, rgba(79, 70, 229, 0.16) 100%)',
                      },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: location.pathname === item.path ? '#6366f1' : 'inherit',
                      minWidth: 40,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text}
                    sx={{
                      '& .MuiTypography-root': {
                        fontWeight: location.pathname === item.path ? 600 : 500,
                        fontSize: '0.9rem',
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
      <Box sx={{ p: 2, borderTop: '1px solid rgba(0, 0, 0, 0.06)' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            p: 2,
            borderRadius: 3,
            background: 'rgba(99, 102, 241, 0.04)',
            border: '1px solid rgba(99, 102, 241, 0.1)',
          }}
        >
          <Avatar
            sx={{
              width: 40,
              height: 40,
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              mr: 2,
            }}
          >
            <AccountCircle />
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: '#1e293b',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user?.first_name || user?.email}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: '#64748b',
                fontSize: '0.75rem',
              }}
            >
              {user?.email}
            </Typography>
          </Box>
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
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ 
                mr: 2, 
                display: { md: 'none' },
                color: '#1e293b',
              }}
            >
              <MenuIcon />
            </IconButton>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700,
                color: '#1e293b',
                display: { xs: 'none', sm: 'block' },
              }}
            >
              {menuItems.find(item => item.path === location.pathname)?.text || 'Dashboard'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Notifications">
              <IconButton
                size="large"
                sx={{ color: '#64748b' }}
              >
                <Badge badgeContent={3} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Settings">
              <IconButton
                size="large"
                sx={{ color: '#64748b' }}
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
                sx={{ color: '#1e293b' }}
              >
                <Avatar 
                  sx={{ 
                    width: 36, 
                    height: 36,
                    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                  }}
                >
                  <AccountCircle />
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
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(20px)',
            background: 'rgba(255, 255, 255, 0.95)',
            minWidth: 200,
          },
        }}
      >
        <MenuItem 
          onClick={handleLogout}
          sx={{
            borderRadius: 2,
            mx: 1,
            mb: 0.5,
            '&:hover': {
              background: 'rgba(239, 68, 68, 0.08)',
            },
          }}
        >
          <ListItemIcon>
            <Logout fontSize="small" sx={{ color: '#ef4444' }} />
          </ListItemIcon>
          <Typography sx={{ color: '#ef4444', fontWeight: 600 }}>
            Logout
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
            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%236366f1" fill-opacity="0.02"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            pointerEvents: 'none',
          },
        }}
      >
        <Box sx={{ pt: { xs: 7, md: 8 }, position: 'relative', zIndex: 1 }}>
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