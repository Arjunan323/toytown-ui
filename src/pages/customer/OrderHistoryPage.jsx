import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Alert,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
  Pagination,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
} from '@mui/material';
import {
  ShoppingBag as ShoppingBagIcon,
  Receipt as ReceiptIcon,
  LocalShipping as LocalShippingIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import Spinner from '../../components/common/Spinner';
import { fetchOrderHistory, clearError } from '../../store/slices/orderSlice';

/**
 * OrderHistoryPage Component
 * 
 * Displays paginated list of customer's past orders with filtering options.
 * 
 * @component
 */
const OrderHistoryPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { orderHistory, pagination, loading, error } = useSelector((state) => state.order);
  const orders = orderHistory || [];
  const totalPages = pagination?.totalPages || 0;

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Fetch orders on mount and when filters change
  useEffect(() => {
    dispatch(fetchOrderHistory({
      page: page - 1,
      size: 10,
      status: statusFilter === 'ALL' ? undefined : statusFilter,
    }));

    return () => {
      dispatch(clearError());
    };
  }, [dispatch, page, statusFilter]);

  // Real-time polling: Update order statuses every 30 seconds
  useEffect(() => {
    const pollingInterval = setInterval(() => {
      dispatch(fetchOrderHistory({
        page: page - 1,
        size: 10,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
      }));
    }, 30000); // 30 seconds

    return () => {
      clearInterval(pollingInterval);
    };
  }, [dispatch, page, statusFilter]);

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo(0, 0);
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setPage(1); // Reset to first page when filter changes
  };

  const handleViewOrder = (orderNumber) => {
    navigate(`/orders/${orderNumber}`);
  };

  const getStatusColor = (status) => {
    const statusColors = {
      PENDING: 'warning',
      PROCESSING: 'info',
      SHIPPED: 'primary',
      DELIVERED: 'success',
      CANCELLED: 'error',
    };
    return statusColors[status] || 'default';
  };

  const getStatusIcon = (status) => {
    const icons = {
      PENDING: <ReceiptIcon />,
      PROCESSING: <ShoppingBagIcon />,
      SHIPPED: <LocalShippingIcon />,
      DELIVERED: <CheckCircleIcon />,
      CANCELLED: <CancelIcon />,
    };
    return icons[status] || <ReceiptIcon />;
  };

  // Loading state
  if (loading && orders.length === 0) {
    return <Spinner fullPage />;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Page Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Order History
        </Typography>
        <Button
          variant="contained"
          startIcon={<ShoppingBagIcon />}
          onClick={() => navigate('/products')}
        >
          Continue Shopping
        </Button>
      </Box>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Filter Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter by Status</InputLabel>
              <Select
                value={statusFilter}
                label="Filter by Status"
                onChange={handleStatusFilterChange}
              >
                <MenuItem value="ALL">All Orders</MenuItem>
                <MenuItem value="PENDING">Pending</MenuItem>
                <MenuItem value="PROCESSING">Processing</MenuItem>
                <MenuItem value="SHIPPED">Shipped</MenuItem>
                <MenuItem value="DELIVERED">Delivered</MenuItem>
                <MenuItem value="CANCELLED">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={8}>
            <Typography variant="body2" color="text.secondary" textAlign={{ xs: 'left', sm: 'right' }}>
              {orders.length > 0 ? `Showing ${orders.length} order(s)` : 'No orders found'}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Empty State */}
      {!loading && orders.length === 0 && (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <ShoppingBagIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No Orders Yet
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            You haven't placed any orders yet. Start shopping to see your orders here!
          </Typography>
          <Button
            variant="contained"
            startIcon={<ShoppingBagIcon />}
            onClick={() => navigate('/products')}
            size="large"
          >
            Start Shopping
          </Button>
        </Paper>
      )}

      {/* Orders List */}
      {orders.length > 0 && (
        <Grid container spacing={3}>
          {orders.map((order) => (
            <Grid item xs={12} key={order.id}>
              <Card variant="outlined" sx={{ '&:hover': { boxShadow: 2 }, transition: 'box-shadow 0.3s' }}>
                <CardContent>
                  {/* Order Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, flexWrap: 'wrap', gap: 2 }}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        Order #{order.orderNumber}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(order.orderDate).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </Typography>
                    </Box>
                    <Chip
                      icon={getStatusIcon(order.orderStatus)}
                      label={order.orderStatus}
                      color={getStatusColor(order.orderStatus)}
                      size="small"
                    />
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Order Items Preview */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Items ({order.lineItems?.length || 0})
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                      {order.lineItems?.slice(0, 3).map((item, index) => (
                        <Box
                          key={index}
                          component="img"
                          src={item.productImageUrl || '/placeholder-toy.jpg'}
                          alt={item.productName}
                          sx={{
                            width: 60,
                            height: 60,
                            objectFit: 'cover',
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: 'divider',
                          }}
                        />
                      ))}
                      {order.lineItems && order.lineItems.length > 3 && (
                        <Box
                          sx={{
                            width: 60,
                            height: 60,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 1,
                            bgcolor: 'action.hover',
                          }}
                        >
                          <Typography variant="caption">+{order.lineItems.length - 3}</Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>

                  {/* Order Summary */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Total Amount
                      </Typography>
                      <Typography variant="h6" color="primary" fontWeight="bold">
                        ₹{order.totalAmount?.toFixed(2) || '0.00'}
                      </Typography>
                    </Box>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleViewOrder(order.orderNumber)}
                    >
                      View Details
                    </Button>
                  </Box>

                  {/* Delivery Info */}
                  {order.orderStatus === 'SHIPPED' && order.shippedDate && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      <Typography variant="body2">
                        Shipped on: {new Date(order.shippedDate).toLocaleDateString('en-IN')}
                      </Typography>
                      {order.trackingNumber && (
                        <Typography variant="body2" fontWeight="bold" sx={{ mt: 0.5 }}>
                          Tracking Number: {order.trackingNumber}
                        </Typography>
                      )}
                    </Alert>
                  )}
                  {order.orderStatus === 'DELIVERED' && order.deliveredDate && (
                    <Alert severity="success" sx={{ mt: 2 }}>
                      <Typography variant="body2">
                        Delivered on: {new Date(order.deliveredDate).toLocaleDateString('en-IN')}
                      </Typography>
                      {order.trackingNumber && (
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          Tracking Number: {order.trackingNumber}
                        </Typography>
                      )}
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            size="large"
          />
        </Box>
      )}

      {/* Help Section */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          Need help with an order? Contact us at support@toytown.com or call 1800-123-4567
        </Typography>
      </Box>
    </Container>
  );
};

export default OrderHistoryPage;
