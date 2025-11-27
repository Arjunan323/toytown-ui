import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Box,
  Typography,
  Divider,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  ShoppingCart as OrdersIcon,
  Category as CategoryIcon,
  Business as ManufacturerIcon,
  Warning as WarningIcon,
  ViewCarousel as BannerIcon,
} from '@mui/icons-material';

const drawerWidth = 240;

/**
 * Admin sidebar navigation component.
 * Provides navigation links for all admin sections.
 */
const AdminSidebar = () => {
  const menuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/admin/dashboard',
    },
    {
      text: 'Products',
      icon: <InventoryIcon />,
      path: '/admin/products',
    },
    {
      text: 'Low Stock Alerts',
      icon: <WarningIcon />,
      path: '/admin/products/low-stock',
    },
    {
      text: 'Orders',
      icon: <OrdersIcon />,
      path: '/admin/orders',
    },
    {
      text: 'Categories',
      icon: <CategoryIcon />,
      path: '/admin/categories',
    },
    {
      text: 'Manufacturers',
      icon: <ManufacturerIcon />,
      path: '/admin/manufacturers',
    },
    {
      text: 'Banners',
      icon: <BannerIcon />,
      path: '/admin/banners',
    },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: 'background.paper',
          borderRight: 1,
          borderColor: 'divider',
        },
      }}
    >
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" color="primary" fontWeight="bold">
            🧸 ToyTown
          </Typography>
        </Box>
      </Toolbar>
      <Divider />

      <List sx={{ pt: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              component={NavLink}
              to={item.path}
              sx={{
                '&.active': {
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                },
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default AdminSidebar;
