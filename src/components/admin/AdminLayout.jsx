import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  IconButton,
  Button,
  Container,
} from '@mui/material';
import { Logout as LogoutIcon } from '@mui/icons-material';
import { adminLogout } from '../../store/slices';
import AdminSidebar from './AdminSidebar';

/**
 * Admin layout component with header, sidebar, and content area.
 * Provides consistent layout for all admin pages.
 */
const AdminLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { adminUser } = useSelector((state) => state.adminAuth);

  const handleLogout = async () => {
    await dispatch(adminLogout());
    navigate('/admin/login');
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main content */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <AppBar
          position="sticky"
          sx={{
            zIndex: (theme) => theme.zIndex.drawer - 1,
            backgroundColor: 'primary.main',
          }}
        >
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              ToyTown Admin Panel
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2">
                {adminUser?.fullName || 'Admin'}
              </Typography>
              <Button
                color="inherit"
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
              >
                Logout
              </Button>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Page content */}
        <Container
          maxWidth="xl"
          sx={{
            flexGrow: 1,
            py: 4,
            px: 3,
            backgroundColor: '#f5f5f5',
          }}
        >
          <Outlet />
        </Container>

        {/* Footer */}
        <Box
          component="footer"
          sx={{
            py: 2,
            px: 3,
            mt: 'auto',
            backgroundColor: 'background.paper',
            borderTop: 1,
            borderColor: 'divider',
          }}
        >
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} ToyTown Admin. All rights reserved.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default AdminLayout;
