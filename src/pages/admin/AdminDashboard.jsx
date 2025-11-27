import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  ShoppingCart as OrdersIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { fetchLowStockProducts } from '../../store/slices';
import { fetchAdminOrders, fetchOrderStats } from '../../store/slices';

/**
 * Admin dashboard page.
 * Displays overview and quick stats for admin management.
 */
const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { lowStockProducts } = useSelector((state) => state.adminProduct);
  const { orders, stats } = useSelector((state) => state.adminOrder);

  useEffect(() => {
    dispatch(fetchLowStockProducts());
    dispatch(fetchOrderStats());
    dispatch(fetchAdminOrders({ page: 0, size: 5, sortBy: 'orderDate', sortDir: 'desc' }));
  }, [dispatch]);

  const dashboardStats = [
    {
      title: 'Total Products',
      value: '0', // Would come from API
      icon: <InventoryIcon sx={{ fontSize: 40 }} />,
      color: '#1976d2',
    },
    {
      title: 'Low Stock Alerts',
      value: Array.isArray(lowStockProducts) ? lowStockProducts.length : 0,
      icon: <WarningIcon sx={{ fontSize: 40 }} />,
      color: '#f57c00',
      action: () => navigate('/admin/products/low-stock'),
    },
    {
      title: 'Pending Orders',
      value: stats.pendingCount || 0,
      icon: <OrdersIcon sx={{ fontSize: 40 }} />,
      color: '#388e3c',
      action: () => navigate('/admin/orders'),
    },
    {
      title: 'Total Revenue',
      value: new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(stats.totalRevenue || 0),
      icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
      color: '#7b1fa2',
    },
  ];

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'warning',
      PROCESSING: 'info',
      SHIPPED: 'primary',
      DELIVERED: 'success',
      CANCELLED: 'error',
    };
    return colors[status] || 'default';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Dashboard
      </Typography>

      <Typography variant="body2" color="text.secondary" paragraph>
        Welcome to the ToyTown Admin Panel. Manage products, orders, and more.
      </Typography>

      <Grid container spacing={3}>
        {/* Stats Cards */}
        {dashboardStats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              elevation={2}
              sx={{
                cursor: stat.action ? 'pointer' : 'default',
                '&:hover': stat.action ? {
                  boxShadow: 6,
                  transform: 'translateY(-2px)',
                  transition: 'all 0.3s',
                } : {},
              }}
              onClick={stat.action}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography color="text.secondary" variant="body2" gutterBottom>
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {stat.value}
                    </Typography>
                  </Box>
                  <Box sx={{ color: stat.color }}>
                    {stat.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
              <Button
                variant="contained"
                startIcon={<InventoryIcon />}
                onClick={() => navigate('/admin/products/create')}
              >
                Add New Product
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/admin/products')}
              >
                Manage Products
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/admin/orders')}
              >
                View Orders
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/admin/banners')}
              >
                Manage Banners
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Recent Orders */}
        {Array.isArray(orders) && orders.length > 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Recent Orders
                </Typography>
                <Button
                  size="small"
                  onClick={() => navigate('/admin/orders')}
                >
                  View All
                </Button>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Order #</strong></TableCell>
                      <TableCell><strong>Customer</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                      <TableCell align="right"><strong>Amount</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orders.slice(0, 5).map((order) => (
                      <TableRow 
                        key={order.id} 
                        hover
                        sx={{ cursor: 'pointer' }}
                        onClick={() => navigate('/admin/orders')}
                      >
                        <TableCell>{order.orderNumber}</TableCell>
                        <TableCell>{order.customerName}</TableCell>
                        <TableCell>
                          <Chip
                            label={order.status}
                            color={getStatusColor(order.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">{formatCurrency(order.totalAmount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        )}

        {/* Low Stock Products */}
        {Array.isArray(lowStockProducts) && lowStockProducts.length > 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Low Stock Alerts ({lowStockProducts.length})
                </Typography>
                <Button
                  size="small"
                  onClick={() => navigate('/admin/products/low-stock')}
                >
                  View All
                </Button>
              </Box>
              <Box>
                {Array.isArray(lowStockProducts) && lowStockProducts.slice(0, 5).map((product) => (
                  <Box
                    key={product.id}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      py: 1,
                      borderBottom: 1,
                      borderColor: 'divider',
                    }}
                  >
                    <Typography variant="body2">{product.name}</Typography>
                    <Typography variant="body2" color="error">
                      {product.stockQuantity} units left
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
